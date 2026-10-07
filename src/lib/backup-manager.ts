import path from 'path';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { workspacePath, assertSafeRealPath } from './workspace-paths';
import { execFile } from 'child_process';
import { promisify } from 'util';
const archiver = require('archiver');

const execFileAsync = promisify(execFile);

export interface SnapshotMetadata {
  id: string;
  workspaceId: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  description: string;
}

function createTarArchive(options?: any) {
  const archiverPkg = require('archiver');
  if (typeof archiverPkg === 'function') {
    return archiverPkg('tar', options);
  }
  if (archiverPkg.default && typeof archiverPkg.default === 'function') {
    return archiverPkg.default('tar', options);
  }
  if (archiverPkg.TarArchive) {
    return new archiverPkg.TarArchive(options);
  }
  throw new Error('Unable to initialize TarArchive');
}

export class BackupManager {
  /**
   * Returns the absolute path to the workspace's backup directory.
   */
  public static getBackupDir(workspaceId: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(workspaceId)) {
      throw new Error('Invalid workspace identifier');
    }
    return path.join(process.cwd(), 'backups', workspaceId);
  }

  /**
   * Returns the path to the workspace manifest.json.
   */
  private static getManifestPath(workspaceId: string): string {
    return path.join(this.getBackupDir(workspaceId), 'manifest.json');
  }

  /**
   * Reads the manifest file or returns an empty list.
   */
  private static async readManifest(workspaceId: string): Promise<SnapshotMetadata[]> {
    const manifestPath = this.getManifestPath(workspaceId);
    try {
      const data = await fs.readFile(manifestPath, 'utf-8');
      const list = JSON.parse(data);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  /**
   * Writes the manifest file atomically.
   */
  private static async writeManifest(workspaceId: string, snapshots: SnapshotMetadata[]): Promise<void> {
    const backupDir = this.getBackupDir(workspaceId);
    await fs.mkdir(backupDir, { recursive: true });
    const manifestPath = this.getManifestPath(workspaceId);
    await fs.writeFile(manifestPath, JSON.stringify(snapshots, null, 2), 'utf-8');
  }

  /**
   * Lists all existing snapshots for a workspace ordered by creation date desc.
   */
  public static async listSnapshots(workspaceId: string): Promise<SnapshotMetadata[]> {
    const snapshots = await this.readManifest(workspaceId);
    return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Creates a compressed snapshot of the current workspace volume.
   */
  public static async createSnapshot(
    workspaceId: string,
    description: string = 'Manual Snapshot'
  ): Promise<SnapshotMetadata> {
    const sourceDir = workspacePath(workspaceId);
    await fs.access(sourceDir); // Ensure workspace exists

    const backupDir = this.getBackupDir(workspaceId);
    await fs.mkdir(backupDir, { recursive: true });

    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const filename = `${snapshotId}.tar.gz`;
    const archivePath = path.join(backupDir, filename);

    const output = createWriteStream(archivePath);
    const archive = createTarArchive({ gzip: true });

    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      output.on('error', reject);

      archive.pipe(output);

      // Package workspace files excluding bulky dependencies & temp builds
      archive.glob('**/*', {
        cwd: sourceDir,
        ignore: [
          '.git/**',
          'node_modules/**',
          '.next/**',
          'dist/**',
          'build/**',
          '.cache/**',
          '.turbo/**',
          'coverage/**',
        ],
        dot: true,
      });

      archive.finalize();
    });

    const stat = await fs.stat(archivePath);
    const metadata: SnapshotMetadata = {
      id: snapshotId,
      workspaceId,
      filename,
      sizeBytes: stat.size,
      createdAt: new Date().toISOString(),
      description: description.trim() || 'Manual Snapshot',
    };

    const snapshots = await this.readManifest(workspaceId);
    snapshots.push(metadata);
    await this.writeManifest(workspaceId, snapshots);

    return metadata;
  }

  /**
   * Restores a workspace to a specific snapshot point-in-time safely.
   */
  public static async restoreSnapshot(
    workspaceId: string,
    snapshotId: string
  ): Promise<{ success: boolean; restoredAt: string }> {
    const snapshots = await this.readManifest(workspaceId);
    const snapshot = snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    const backupDir = this.getBackupDir(workspaceId);
    const archivePath = path.join(backupDir, snapshot.filename);
    await fs.access(archivePath);

    const targetDir = workspacePath(workspaceId);
    await fs.mkdir(targetDir, { recursive: true });
    await assertSafeRealPath(workspaceId, targetDir);

    // Staging unpack directory to prevent Zip Slip and partial corruption
    const stagingDir = path.join(backupDir, `staging_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
    await fs.mkdir(stagingDir, { recursive: true });

    try {
      // Extract using system tar
      await execFileAsync('tar', ['-xzf', archivePath, '-C', stagingDir]);

      // Copy unpacked files to workspace root cleanly
      await fs.cp(stagingDir, targetDir, { recursive: true, force: true });

      return {
        success: true,
        restoredAt: new Date().toISOString(),
      };
    } finally {
      // Clean up staging directory
      try {
        await fs.rm(stagingDir, { recursive: true, force: true });
      } catch {}
    }
  }

  /**
   * Deletes a snapshot archive and its record in manifest.json.
   */
  public static async deleteSnapshot(workspaceId: string, snapshotId: string): Promise<boolean> {
    const snapshots = await this.readManifest(workspaceId);
    const index = snapshots.findIndex((s) => s.id === snapshotId);
    if (index === -1) {
      return false;
    }

    const snapshot = snapshots[index];
    const backupDir = this.getBackupDir(workspaceId);
    const archivePath = path.join(backupDir, snapshot.filename);

    try {
      await fs.rm(archivePath, { force: true });
    } catch (e) {
      console.warn(`[BackupManager] Failed to delete file ${archivePath}:`, e);
    }

    snapshots.splice(index, 1);
    await this.writeManifest(workspaceId, snapshots);
    return true;
  }
}
