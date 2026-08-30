
import { auth } from '@/auth';

import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/api-utils';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return apiError('Missing workspaceId', 400);
  }

  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return apiError('Unauthorized', 401);
  }

  const userId = session.user.id;

  try {
    // 1. Check if the workspace (project) exists
    console.log(`[AccessCheck] Checking workspace: ${workspaceId} for user ${userId}`);
    const project = await db.project.findFirst({
      where: {
        OR: [{ id: workspaceId }, { name: workspaceId }],
      },
      include: {
        members: true,
      },
    });

    if (!project) {
      const workspacePath = path.join(process.cwd(), 'workspaces', workspaceId);
      console.log(`[AccessCheck] Project not found in DB. Checking local path: ${workspacePath}`);
      if (fs.existsSync(workspacePath)) {
        console.log(`[AccessCheck] Local path exists. Granting OWNER access.`);
        // For local fallback, we assume the name is the ID provided
        return apiResponse({
          success: true,
          role: 'OWNER',
          user: session.user,
          projectName: workspaceId,
        });
      }
      console.log(`[AccessCheck] Local path does NOT exist.`);
      return apiError('Workspace not found', 404);
    }

    // 2. Check if the user is the owner
    if (project.ownerId === userId) {
      return apiResponse({
        success: true,
        role: 'OWNER',
        user: session.user,
        projectName: project.name,
      });
    }

    // 3. Check if the user is a member
    const member = project.members.find((m) => m.userId === userId);
    if (member) {
      return apiResponse({
        success: true,
        role: member.role,
        user: session.user,
        projectName: project.name,
      });
    }

    return apiError('Access denied', 403);
  } catch (error: any) {
    console.error('Workspace access check error:', error);
    return apiError('Internal Server Error', 500, error.message);
  }
}
