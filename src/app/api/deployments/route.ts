import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { addJob } from '@/lib/queue';
import { getWorkspaceProject } from '@/lib/workspace-auth';
import { workspacePath } from '@/lib/workspace-paths';
import { readCloudLabConfigFile } from '@/lib/runtime-config';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  if (typeof projectId !== 'string' || !projectId.trim() || projectId.length > 128) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const project = await getWorkspaceProject(session.user.id, projectId);
  if (!project) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const deployments = await db.deployment.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ deployments }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }
  const projectId = body?.projectId;

  if (typeof projectId !== 'string' || !projectId.trim() || projectId.length > 128) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const authorizedProject = await getWorkspaceProject(session.user.id, projectId);
  if (!authorizedProject || authorizedProject.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Only project owners can deploy' }, { status: 403 });
  }
  const project = await db.project.findUnique({ where: { id: authorizedProject.id } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  try {
    await readCloudLabConfigFile(workspacePath(project.id));
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Invalid cloudlab.yaml configuration' }, { status: 400 });
  }

  // 1. Create Deployment Record
  const deployment = await db.deployment.create({
    data: {
      projectId: project.id,
      status: 'QUEUED',
    }
  });

  try {
    await addJob(
      'deployment',
      { deploymentId: deployment.id, projectId: project.id, userId: session.user.id },
      { singletonKey: deployment.id }
    );
  } catch {
    await db.deployment.update({ where: { id: deployment.id }, data: { status: 'FAILED' } }).catch(() => {});
    return NextResponse.json({ error: 'Deployment queue is temporarily unavailable.' }, { status: 503 });
  }

  const { logAuditEvent } = await import('@/lib/audit');
  await logAuditEvent(session.user.id, 'DEPLOYMENT_START', {
    workspaceId: project.id,
    deploymentId: deployment.id,
  });

  return NextResponse.json({ deployment }, { headers: { 'Cache-Control': 'private, no-store' } });
}
