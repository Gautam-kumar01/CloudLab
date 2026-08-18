import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
  }

  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Check if the workspace (project) exists
    console.log(`[AccessCheck] Checking workspace: ${workspaceId} for user ${userId}`);
    const project = await db.project.findFirst({
      where: { 
        OR: [
          { id: workspaceId },
          { name: workspaceId }
        ]
      },
      include: {
        members: true
      }
    });

    if (!project) {
      const workspacePath = path.join(process.cwd(), 'workspaces', workspaceId);
      console.log(`[AccessCheck] Project not found in DB. Checking local path: ${workspacePath}`);
      if (fs.existsSync(workspacePath)) {
        console.log(`[AccessCheck] Local path exists. Granting OWNER access.`);
        return NextResponse.json({ success: true, role: 'OWNER', user: session.user });
      }
      console.log(`[AccessCheck] Local path does NOT exist.`);
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // 2. Check if the user is the owner
    if (project.ownerId === userId) {
      return NextResponse.json({ success: true, role: 'OWNER', user: session.user });
    }

    // 3. Check if the user is a member
    const member = project.members.find(m => m.userId === userId);
    if (member) {
      return NextResponse.json({ success: true, role: member.role, user: session.user });
    }

    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  } catch (error: any) {
    console.error('Workspace access check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
