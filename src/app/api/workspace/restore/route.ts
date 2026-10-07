import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { canManageWorkspace } from '@/lib/workspace-auth';
import { BackupManager } from '@/lib/backup-manager';
import { apiResponse, apiError } from '@/lib/api-utils';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json().catch(() => ({}));
    const { workspaceId, snapshotId } = body;

    if (!workspaceId || !snapshotId) {
      return apiError('workspaceId and snapshotId are required', 400);
    }

    const canManage = await canManageWorkspace(session.user.id, workspaceId);
    if (!canManage) {
      return apiError('Forbidden. Workspace owner permissions required to restore snapshots.', 403);
    }

    const result = await BackupManager.restoreSnapshot(workspaceId, snapshotId);

    await logAuditEvent(session.user.id, 'SNAPSHOT_RESTORE', {
      workspaceId,
      snapshotId,
      restoredAt: result.restoredAt,
    });

    return apiResponse(result);
  } catch (error: any) {
    console.error('Restore snapshot error:', error);
    return apiError('Failed to restore snapshot', 500, error.message);
  }
}
