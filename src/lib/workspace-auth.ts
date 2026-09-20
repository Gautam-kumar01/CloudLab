import fs from 'fs';
import { db } from './db';
import { workspacePath } from './workspace-paths';

/**
 * Checks if a user has access to a given workspace.
 *
 * Access is granted if:
 * 1. The user is the owner of the project associated with the workspace.
 * 2. The user is a collaborator (member) of the project.
 * 3. Fallback: Workspace folder exists on disk.
 *
 * @param userId The ID of the authenticated user.
 * @param workspaceId The ID of the workspace (which corresponds to the Project ID).
 * @returns boolean indicating if access is allowed.
 */
export async function getWorkspaceProject(userId: string, workspaceId: string) {
  if (!userId || !workspaceId) return null;

  try {
    const project = await db.project.findFirst({
      where: {
        OR: [{ id: workspaceId }, { name: workspaceId }],
      },
      include: {
        members: true,
      },
    });

    if (project) {
      if (project.status === 'DISABLED') {
        console.warn(`Attempted to access DISABLED workspace: ${workspaceId}`);
        return null;
      }

      if (project.ownerId === userId) return project;
      const isMember = project.members.some((member: any) => member.userId === userId);
      if (isMember) return project;
      return null;
    }

    // Check if workspaceId is a Container ID
    const container = await db.container.findFirst({
      where: { id: workspaceId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (container?.project) {
      const proj = container.project;
      if (proj.status === 'DISABLED') return null;
      if (proj.ownerId === userId) return proj;
      const isMember = proj.members.some((member: any) => member.userId === userId);
      if (isMember) return proj;
      return null;
    }

    // Disk-based fallback: check if local workspace folder exists on disk
    try {
      const localPath = workspacePath(workspaceId);
      if (fs.existsSync(localPath)) {
        return {
          id: workspaceId,
          name: workspaceId,
          ownerId: userId,
          members: [],
          status: 'ACTIVE',
        } as any;
      }
    } catch (e) {}

    return null;
  } catch (error) {
    console.error('Error checking workspace access:', error);
    try {
      const localPath = workspacePath(workspaceId);
      if (fs.existsSync(localPath)) {
        return {
          id: workspaceId,
          name: workspaceId,
          ownerId: userId,
          members: [],
          status: 'ACTIVE',
        } as any;
      }
    } catch (e) {}
    return null;
  }
}

export async function canAccessWorkspace(userId: string, workspaceId: string): Promise<boolean> {
  const project = await getWorkspaceProject(userId, workspaceId);
  return !!project;
}

const ROLE_LEVELS: Record<string, number> = { VIEWER: 1, EDITOR: 2, OWNER: 3 };

export async function getWorkspaceRole(userId: string, workspaceId: string): Promise<string | null> {
  const project = await getWorkspaceProject(userId, workspaceId);
  if (!project) return null;
  return project.members?.find((member: any) => member.userId === userId)?.role || 'OWNER';
}

export async function canEditWorkspace(userId: string, workspaceId: string): Promise<boolean> {
  const role = await getWorkspaceRole(userId, workspaceId);
  return !!role && ROLE_LEVELS[role] >= ROLE_LEVELS.EDITOR;
}

export async function canManageWorkspace(userId: string, workspaceId: string): Promise<boolean> {
  const role = await getWorkspaceRole(userId, workspaceId);
  return role === 'OWNER';
}
