import path from 'node:path';
import { promises as fs } from 'node:fs';

const WORKSPACES_ROOT = path.resolve(process.cwd(), 'workspaces');

export function workspacePath(projectId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    throw new Error('Invalid workspace identifier');
  }
  return path.join(WORKSPACES_ROOT, projectId);
}

export function workspaceFilePath(projectId: string, relativePath: string): string {
  const root = workspacePath(projectId);
  const normalized = path.normalize(relativePath);
  if (!relativePath || path.isAbsolute(relativePath) || normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new Error('Invalid workspace file path');
  }
  const target = path.resolve(root, normalized);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error('Invalid workspace file path');
  }
  return target;
}

export async function ensureWorkspacePath(projectId: string): Promise<string> {
  const root = workspacePath(projectId);
  await fs.mkdir(root, { recursive: true });
  return root;
}

export { WORKSPACES_ROOT };
