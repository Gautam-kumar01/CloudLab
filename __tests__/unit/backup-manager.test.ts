import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackupManager } from '@/lib/backup-manager';
import { promises as fs } from 'fs';
import path from 'path';

describe('BackupManager', () => {
  const testWorkspaceId = 'test-workspace-backup';
  const testWorkspaceDir = path.join(process.cwd(), 'workspaces', testWorkspaceId);
  const testBackupDir = path.join(process.cwd(), 'backups', testWorkspaceId);

  beforeEach(async () => {
    await fs.mkdir(testWorkspaceDir, { recursive: true });
    await fs.writeFile(path.join(testWorkspaceDir, 'index.js'), 'console.log("hello test");', 'utf-8');
  });

  afterEach(async () => {
    try {
      await fs.rm(testWorkspaceDir, { recursive: true, force: true });
      await fs.rm(testBackupDir, { recursive: true, force: true });
    } catch {}
  });

  it('rejects invalid workspace identifiers with path traversal attempts', () => {
    expect(() => BackupManager.getBackupDir('../escape')).toThrow('Invalid workspace identifier');
    expect(() => BackupManager.getBackupDir('workspace/nested')).toThrow('Invalid workspace identifier');
  });

  it('creates, lists, and deletes a compressed workspace snapshot', async () => {
    const snapshot = await BackupManager.createSnapshot(testWorkspaceId, 'Initial test snapshot');
    expect(snapshot.id).toBeDefined();
    expect(snapshot.workspaceId).toBe(testWorkspaceId);
    expect(snapshot.description).toBe('Initial test snapshot');
    expect(snapshot.sizeBytes).toBeGreaterThan(0);

    const list = await BackupManager.listSnapshots(testWorkspaceId);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(snapshot.id);

    const deleted = await BackupManager.deleteSnapshot(testWorkspaceId, snapshot.id);
    expect(deleted).toBe(true);

    const afterList = await BackupManager.listSnapshots(testWorkspaceId);
    expect(afterList.length).toBe(0);
  });
});
