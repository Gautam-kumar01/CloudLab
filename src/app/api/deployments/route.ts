import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { LocalDockerDeployer } from '@/lib/deployer';

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

  const deployments = await db.deployment.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
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

  // 0. Ensure Project exists in DB (for unmanaged local workspaces)
  let project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) {
    const fs = require('fs');
    const path = require('path');
    const workspacePath = path.join(process.cwd(), 'workspaces', projectId);
    if (fs.existsSync(workspacePath)) {
      project = await db.project.create({
        data: {
          id: projectId,
          name: projectId,
          ownerId: session.user.id
        }
      });
    } else {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
  }

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

  // 3. Trigger Async Deployment (Fire and Forget)
  // In a real app we'd use a message queue, but for MVP we run async
  const deployer = new LocalDockerDeployer();
  
  (async () => {
    try {
      await db.deployment.update({
        where: { id: deployment.id },
        data: { status: 'RUNNING' }
      });

      const result = await deployer.deploy(projectId, envVars);

      if (result.success) {
        await db.deployment.update({
          where: { id: deployment.id },
          data: { status: 'SUCCESS', url: result.url }
        });
      } else {
        await db.deployment.update({
          where: { id: deployment.id },
          data: { status: 'FAILED' }
        });
        console.error(`Deployment ${deployment.id} failed:`, result.error);
      }
    } catch (e: any) {
      await db.deployment.update({
        where: { id: deployment.id },
        data: { status: 'FAILED' }
      });
      console.error(`Deployment ${deployment.id} failed exceptionally:`, e.message);
    }
  })();

  return NextResponse.json({ deployment });
}
