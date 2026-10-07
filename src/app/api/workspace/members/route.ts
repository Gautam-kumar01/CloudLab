import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { canAccessWorkspace, canManageWorkspace, getWorkspaceProject } from '@/lib/workspace-auth';
import { apiResponse, apiError } from '@/lib/api-utils';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return apiError('workspaceId query parameter is required', 400);
    }

    const hasAccess = await canAccessWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const project = await db.project.findFirst({
      where: { OR: [{ id: workspaceId }, { name: workspaceId }] },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!project) {
      return apiError('Workspace not found', 404);
    }

    return apiResponse({
      owner: project.owner,
      members: project.members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      })),
    });
  } catch (error: any) {
    console.error('Fetch members error:', error);
    return apiError('Failed to fetch workspace members', 500, error.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json().catch(() => ({}));
    const { workspaceId, email, role } = body;

    if (!workspaceId || !email) {
      return apiError('workspaceId and email are required', 400);
    }

    const assignedRole = role === 'EDITOR' ? 'EDITOR' : 'VIEWER';

    const canManage = await canManageWorkspace(session.user.id, workspaceId);
    if (!canManage) {
      return apiError('Forbidden. Only workspace owners can invite or manage members.', 403);
    }

    const project = await getWorkspaceProject(session.user.id, workspaceId);
    if (!project) {
      return apiError('Workspace not found', 404);
    }

    // Find invited user by email
    const targetUser = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!targetUser) {
      return apiError(`User with email "${email}" does not have a CloudLab account`, 404);
    }

    if (targetUser.id === project.ownerId) {
      return apiError('User is already the workspace owner', 400);
    }

    const member = await db.workspaceMember.upsert({
      where: {
        userId_projectId: {
          userId: targetUser.id,
          projectId: project.id,
        },
      },
      update: {
        role: assignedRole,
      },
      create: {
        userId: targetUser.id,
        projectId: project.id,
        role: assignedRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    await logAuditEvent(session.user.id, 'WORKSPACE_MEMBER_ADD', {
      workspaceId,
      invitedEmail: email,
      role: assignedRole,
      memberUserId: targetUser.id,
    });

    return apiResponse({
      id: member.id,
      role: member.role,
      user: member.user,
    });
  } catch (error: any) {
    console.error('Invite member error:', error);
    return apiError('Failed to invite member', 500, error.message);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    const memberId = searchParams.get('memberId');

    if (!workspaceId || !memberId) {
      return apiError('workspaceId and memberId are required', 400);
    }

    const canManage = await canManageWorkspace(session.user.id, workspaceId);
    if (!canManage) {
      return apiError('Forbidden. Only workspace owners can remove members.', 403);
    }

    // Verify member belongs to this exact workspace
    const member = await db.workspaceMember.findFirst({
      where: {
        id: memberId,
        projectId: workspaceId,
      },
    });

    if (!member) {
      return apiError('Member not found in the specified workspace', 404);
    }

    await db.workspaceMember.delete({
      where: { id: member.id },
    });

    await logAuditEvent(session.user.id, 'WORKSPACE_MEMBER_REMOVE', {
      workspaceId,
      memberId,
    });

    return apiResponse({ success: true, memberId: member.id });
  } catch (error: any) {
    console.error('Remove member error:', error);
    return apiError('Failed to remove workspace member', 500, error.message);
  }
}
