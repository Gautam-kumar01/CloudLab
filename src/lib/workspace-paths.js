const path = require('node:path');
const fs = require('node:fs');
const { promises: fsPromises } = fs;

const WORKSPACES_ROOT = path.resolve(process.cwd(), 'workspaces');

function workspacePath(projectId) {
  if (!projectId || typeof projectId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    throw new Error('Invalid workspace identifier');
  }
  return path.join(WORKSPACES_ROOT, projectId);
}

function workspaceFilePath(projectId, relativePath, options) {
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

async function assertSafeRealPath(projectId, absoluteTarget) {
  const root = workspacePath(projectId);
  let realRoot;
  try {
    realRoot = await fsPromises.realpath(root);
  } catch {
    realRoot = path.resolve(root);
  }

  try {
    const realTarget = await fsPromises.realpath(absoluteTarget);
    if (realTarget !== realRoot && !realTarget.startsWith(`${realRoot}${path.sep}`)) {
      throw new Error('Access denied: Symlink resolves outside workspace root');
    }
    return realTarget;
  } catch (err) {
    if (err.code === 'ENOENT') {
      const parentDir = path.dirname(absoluteTarget);
      try {
        const realParent = await fsPromises.realpath(parentDir);
        if (realParent !== realRoot && !realParent.startsWith(`${realRoot}${path.sep}`)) {
          throw new Error('Access denied: Parent directory resolves outside workspace root');
        }
      } catch (parentErr) {
        if (parentErr.code !== 'ENOENT') throw parentErr;
      }
      return absoluteTarget;
    }
    throw err;
  }
}

async function ensureWorkspacePath(projectId) {
  const root = workspacePath(projectId);
  await fsPromises.mkdir(root, { recursive: true });
  return root;
}

module.exports = {
  WORKSPACES_ROOT,
  workspacePath,
  workspaceFilePath,
  assertSafeRealPath,
  ensureWorkspacePath,
};
