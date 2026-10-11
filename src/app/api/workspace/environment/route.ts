import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getWorkspaceProject } from '@/lib/workspace-auth';
import { validateEnvironmentVariableName } from '@/lib/runtime-config';
import { encryptEnvironmentValue } from '@/lib/environment-secrets';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'private, no-store' };
const MAX_SECRET_LENGTH = 4096;
const MAX_REQUEST_BYTES = 20 * 1024;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

async function readLimitedJson(request: NextRequest) {
  if (!request.body) throw new Error('Request body must be valid JSON');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new Error('Request is too large');
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } catch (error: any) {
    if (error?.message === 'Request is too large') throw error;
    throw new Error('Request body must be valid JSON');
  }
}

async function getOwnerProject(userId: string, workspaceId: unknown) {
  if (typeof workspaceId !== 'string' || !workspaceId.trim() || workspaceId.length > 128) return null;
  const project = await getWorkspaceProject(userId, workspaceId);
  if (!project || project.ownerId !== userId) return null;
  return project;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return json({ error: 'Unauthorized' }, 401);
    const workspaceId = new URL(request.url).searchParams.get('id');
    const project = await getOwnerProject(session.user.id, workspaceId);
    if (!project) return json({ error: 'Workspace not found or owner access required' }, 404);

    const variables = await db.environmentVariable.findMany({
      where: { projectId: project.id },
      select: { key: true },
      orderBy: { key: 'asc' },
    });
    return json({ variables: variables.map(({ key }) => ({ key })) });
  } catch (error) {
    console.error('[WorkspaceEnvironment] Failed to list variable names:', error);
    return json({ error: 'Could not load workspace environment variable names' }, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return json({ error: 'Unauthorized' }, 401);
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return json({ error: 'Request is too large' }, 413);
    }

    let body: any;
    try {
      body = await readLimitedJson(request);
    } catch (error: any) {
      return json({ error: error?.message || 'Request body must be valid JSON' }, error?.message === 'Request is too large' ? 413 : 400);
    }
    const project = await getOwnerProject(session.user.id, body?.workspaceId);
    if (!project) return json({ error: 'Workspace not found or owner access required' }, 404);

    let key: string;
    try {
      key = validateEnvironmentVariableName(body?.key);
    } catch (error: any) {
      return json({ error: error?.message || 'Invalid environment variable name' }, 400);
    }
    if (typeof body?.value !== 'string' || body.value.length > MAX_SECRET_LENGTH || body.value.includes('\0')) {
      return json({ error: 'Value must be text no longer than 4096 characters.' }, 400);
    }

    let encryptedValue: string;
    try {
      encryptedValue = encryptEnvironmentValue(body.value);
    } catch {
      return json({ error: 'Secret encryption is not configured. Set a stable encryption key and retry.' }, 503);
    }

    await db.environmentVariable.upsert({
      where: { projectId_key: { projectId: project.id, key } },
      update: { value: encryptedValue },
      create: { projectId: project.id, key, value: encryptedValue },
      select: { key: true },
    });
    await logAuditEvent(session.user.id, 'WORKSPACE_ENV_SET', { workspaceId: project.id, key });
    return json({ success: true, key });
  } catch (error) {
    console.error('[WorkspaceEnvironment] Failed to save variable:', error);
    return json({ error: 'Could not save the environment variable' }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return json({ error: 'Unauthorized' }, 401);
    const params = new URL(request.url).searchParams;
    const project = await getOwnerProject(session.user.id, params.get('id'));
    if (!project) return json({ error: 'Workspace not found or owner access required' }, 404);

    let key: string;
    try {
      key = validateEnvironmentVariableName(params.get('key'));
    } catch (error: any) {
      return json({ error: error?.message || 'Invalid environment variable name' }, 400);
    }
    const result = await db.environmentVariable.deleteMany({ where: { projectId: project.id, key } });
    if (result.count > 0) {
      await logAuditEvent(session.user.id, 'WORKSPACE_ENV_REMOVE', { workspaceId: project.id, key });
    }
    return json({ success: true, key, deleted: result.count > 0 });
  } catch (error) {
    console.error('[WorkspaceEnvironment] Failed to remove variable:', error);
    return json({ error: 'Could not remove the environment variable' }, 500);
  }
}
