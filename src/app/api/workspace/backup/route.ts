import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { canAccessWorkspace, canEditWorkspace, canManageWorkspace } from '@/lib/workspace-auth';
import { BackupManager } from '@/lib/backup-manager';
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

    const snapshots = await BackupManager.listSnapshots(workspaceId);
    return apiResponse(snapshots);
  } catch (error: any) {
    console.error('List snapshots error:', error);
    return apiError('Failed to list workspace snapshots', 500, error.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json().catch(() => ({}));
    const { workspaceId, description } = body;
    if (!workspaceId) {
      return apiError('workspaceId is required', 400);
    }

    const canEdit = await canEditWorkspace(session.user.id, workspaceId);
    if (!canEdit) {
      return apiError('Forbidden. Editor role required to take snapshots.', 403);
    }

    const snapshot = await BackupManager.createSnapshot(workspaceId, description);

    await logAuditEvent(session.user.id, 'SNAPSHOT_CREATE', {
      workspaceId,
      snapshotId: snapshot.id,
      sizeBytes: snapshot.sizeBytes,
      description: snapshot.description,
    });

    return apiResponse(snapshot);
  } catch (error: any) {
    console.error('Create snapshot error:', error);
    return apiError('Failed to create snapshot', 500, error.message);
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
    const snapshotId = searchParams.get('snapshotId');

    if (!workspaceId || !snapshotId) {
      return apiError('workspaceId and snapshotId are required', 400);
    }

    const canManage = await canManageWorkspace(session.user.id, workspaceId);
    if (!canManage) {
      return apiError('Forbidden. Owner role required to delete snapshots.', 403);
    }

    const deleted = await BackupManager.deleteSnapshot(workspaceId, snapshotId);
    if (!deleted) {
      return apiError('Snapshot not found or already deleted', 404);
    }

    await logAuditEvent(session.user.id, 'SNAPSHOT_DELETE', {
      workspaceId,
      snapshotId,
    });

    return apiResponse({ success: true, snapshotId });
  } catch (error: any) {
    console.error('Delete snapshot error:', error);
    return apiError('Failed to delete snapshot', 500, error.message);
  }
}
