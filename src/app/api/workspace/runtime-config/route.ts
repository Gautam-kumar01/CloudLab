import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canEditWorkspace, getWorkspaceProject } from '@/lib/workspace-auth';
import { workspacePath } from '@/lib/workspace-paths';
import { readCloudLabConfigFile } from '@/lib/runtime-config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const workspaceId = new URL(request.url).searchParams.get('id');
  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const project = await getWorkspaceProject(session.user.id, workspaceId);
  if (!project) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }
  if (!(await canEditWorkspace(session.user.id, project.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
  }

  try {
    const config = await readCloudLabConfigFile(workspacePath(project.id));
    return NextResponse.json({
      found: config !== null,
      valid: config !== null,
      config,
      canDeploy: project.ownerId === session.user.id,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: any) {
    return NextResponse.json({
      found: true,
      valid: false,
      config: null,
      error: error?.message || 'Invalid cloudlab.yaml configuration',
      canDeploy: project.ownerId === session.user.id,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  }
}
