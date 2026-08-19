import { promises as fs } from 'fs';
import path from 'path';

// 500 MB quota
export const WORKSPACE_QUOTA_BYTES = 500 * 1024 * 1024;

/**
 * Recursively calculates the total size of a directory in bytes.
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  let size = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += await getDirectorySize(fullPath);
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }
  } catch (err: any) {
    // If directory doesn't exist or permission error, just ignore and return size collected so far
    if (err.code !== 'ENOENT') {
      console.error(`Error calculating size for ${dirPath}:`, err);
    }
  }
  return size;
}

/**
 * Checks if adding `additionalBytes` to the current workspace usage would exceed the quota.
 */
export async function checkQuota(workspacePath: string, additionalBytes: number = 0): Promise<{ ok: boolean, currentSize: number }> {
  const currentSize = await getDirectorySize(workspacePath);
  if (currentSize + additionalBytes > WORKSPACE_QUOTA_BYTES) {
    return { ok: false, currentSize };
  }
  return { ok: true, currentSize };
}
