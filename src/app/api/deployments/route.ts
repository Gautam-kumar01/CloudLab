import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { addJob } from '@/lib/queue';
import { canManageWorkspace, canAccessWorkspace } from '@/lib/workspace-auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  if (!(await canAccessWorkspace(session.user.id, projectId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const deployments = await db.deployment.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ deployments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  if (!(await canManageWorkspace(session.user.id, projectId))) {
    return NextResponse.json({ error: 'Only project owners can deploy' }, { status: 403 });
  }
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  // 1. Create Deployment Record
  const deployment = await db.deployment.create({
    data: {
      projectId,
      status: 'QUEUED',
    }
  });

  // 2. Fetch Env Vars
  const envVarsRecords = await db.environmentVariable.findMany({
    where: { projectId }
  });
  const envVars = envVarsRecords.reduce((acc: Record<string, string>, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  await addJob('deployment', { deploymentId: deployment.id, projectId, envVars }, { singletonKey: deployment.id });

  return NextResponse.json({ deployment });
}
