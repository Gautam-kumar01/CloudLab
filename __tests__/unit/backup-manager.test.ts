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

  it('restores snapshot cleanly removing post-snapshot files while preserving .git', async () => {
    // 1. Setup workspace with git dir and initial file
    const gitDir = path.join(testWorkspaceDir, '.git');
    await fs.mkdir(gitDir, { recursive: true });
    await fs.writeFile(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main', 'utf-8');

    // 2. Take initial snapshot
    const snapshot = await BackupManager.createSnapshot(testWorkspaceId, 'Baseline snapshot');

    // 3. Simulate post-snapshot additions and modifications
    const postSnapshotFile = path.join(testWorkspaceDir, 'post-snapshot-added.txt');
    await fs.writeFile(postSnapshotFile, 'This should be removed during restore', 'utf-8');
    await fs.writeFile(path.join(testWorkspaceDir, 'index.js'), 'console.log("modified");', 'utf-8');

    // 4. Restore snapshot
    const result = await BackupManager.restoreSnapshot(testWorkspaceId, snapshot.id);
    expect(result.success).toBe(true);

    // 5. Verify restored state: post-snapshot file is removed, index.js restored, .git preserved
    const filesInWorkspace = await fs.readdir(testWorkspaceDir);
    expect(filesInWorkspace).toContain('index.js');
    expect(filesInWorkspace).toContain('.git');
    expect(filesInWorkspace).not.toContain('post-snapshot-added.txt');

    const restoredContent = await fs.readFile(path.join(testWorkspaceDir, 'index.js'), 'utf-8');
    expect(restoredContent).toBe('console.log("hello test");');

    const gitHead = await fs.readFile(path.join(gitDir, 'HEAD'), 'utf-8');
    expect(gitHead).toBe('ref: refs/heads/main');
  });

  it('enforces retention cap and prunes oldest snapshot archive', async () => {
    expect(BackupManager.MAX_SNAPSHOTS).toBe(10);

    // Create 11 snapshots with small delay
    const created: string[] = [];
    for (let i = 0; i < 11; i++) {
      const snap = await BackupManager.createSnapshot(testWorkspaceId, `Snapshot ${i}`);
      created.push(snap.id);
    }

    const list = await BackupManager.listSnapshots(testWorkspaceId);
    expect(list.length).toBe(10);
    // The very first snapshot created should have been pruned
    const oldestId = created[0];
    expect(list.find((s) => s.id === oldestId)).toBeUndefined();
    // The latest snapshot should exist
    expect(list.find((s) => s.id === created[10])).toBeDefined();
  });

  it('rolls back workspace state if copy operation fails during restore', async () => {
    // 1. Take snapshot
    const snapshot = await BackupManager.createSnapshot(testWorkspaceId, 'Rollback test snapshot');

    // 2. Change workspace content to something we expect to be retained upon failed restore
    const expectedContent = 'console.log("original untouched content");';
    await fs.writeFile(path.join(testWorkspaceDir, 'index.js'), expectedContent, 'utf-8');

    // 3. Spy on fs.cp to simulate an unexpected I/O failure
    const originalCp = fs.cp;
    const cpSpy = vi.spyOn(fs, 'cp').mockRejectedValueOnce(new Error('Simulated disk failure'));

    // 4. Attempt restore, expect it to reject
    await expect(BackupManager.restoreSnapshot(testWorkspaceId, snapshot.id)).rejects.toThrow('Simulated disk failure');

    // 5. Verify that original workspace content was safely rolled back
    const contentAfterFailure = await fs.readFile(path.join(testWorkspaceDir, 'index.js'), 'utf-8');
    expect(contentAfterFailure).toBe(expectedContent);

    cpSpy.mockRestore();
  });
});
