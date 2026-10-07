import path from 'node:path';
import { promises as fs } from 'node:fs';

const WORKSPACES_ROOT = path.resolve(process.cwd(), 'workspaces');

export function workspacePath(projectId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    throw new Error('Invalid workspace identifier');
  }
  return path.join(WORKSPACES_ROOT, projectId);
}

export function workspaceFilePath(
  projectId: string,
  relativePath: string,
  options?: { allowGit?: boolean }
): string {
  const root = workspacePath(projectId);
  if (!relativePath || typeof relativePath !== 'string') {
    throw new Error('Invalid workspace file path');
  }

  if (relativePath.includes('\0')) {
    throw new Error('Invalid workspace file path: null byte detected');
  }

  const normalized = path.normalize(relativePath);
  if (path.isAbsolute(relativePath) || normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new Error('Invalid workspace file path');
  }

  const target = path.resolve(root, normalized);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error('Invalid workspace file path');
  }

  if (!options?.allowGit) {
    const forwardNorm = normalized.replace(/\\/g, '/');
    if (
      forwardNorm === '.git' ||
      forwardNorm.startsWith('.git/') ||
      forwardNorm.includes('/.git/') ||
      forwardNorm.endsWith('/.git')
    ) {
      throw new Error('Access to .git directory or files is restricted');
    }
  }

  return target;
}

export async function assertSafeRealPath(projectId: string, absoluteTarget: string): Promise<string> {
  const root = workspacePath(projectId);
  let realRoot: string;
  try {
    realRoot = await fs.realpath(root);
  } catch {
    realRoot = path.resolve(root);
  }

  try {
    const realTarget = await fs.realpath(absoluteTarget);
    if (realTarget !== realRoot && !realTarget.startsWith(`${realRoot}${path.sep}`)) {
      throw new Error('Access denied: Symlink resolves outside workspace root');
    }
    return realTarget;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      const parentDir = path.dirname(absoluteTarget);
      try {
        const realParent = await fs.realpath(parentDir);
        if (realParent !== realRoot && !realParent.startsWith(`${realRoot}${path.sep}`)) {
          throw new Error('Access denied: Parent directory resolves outside workspace root');
        }
      } catch (parentErr: any) {
        if (parentErr.code !== 'ENOENT') throw parentErr;
      }
      return absoluteTarget;
    }
    throw err;
  }
}

export async function ensureWorkspacePath(projectId: string): Promise<string> {
  const root = workspacePath(projectId);
  await fs.mkdir(root, { recursive: true });
  return root;
}

export { WORKSPACES_ROOT };
