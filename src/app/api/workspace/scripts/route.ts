import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { apiResponse, apiError } from '@/lib/api-utils';
import { workspacePath } from '@/lib/workspace-paths';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');

    if (!workspaceId) {
      return apiError('Missing workspace id', 400);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const hasAccess = await canEditWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const workspaceRoot = workspacePath(workspaceId);
    const packageJsonPath = path.join(workspaceRoot, 'package.json');

    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const parsed = JSON.parse(content);
      const scripts: Record<string, string> = parsed.scripts || {};
      const dependencies = Object.keys(parsed.dependencies || {});
      const devDependencies = Object.keys(parsed.devDependencies || {});

      // Detect package manager
      let packageManager = 'npm';
      try {
        const rootEntries = await fs.readdir(workspaceRoot);
        if (rootEntries.includes('pnpm-lock.yaml')) packageManager = 'pnpm';
        else if (rootEntries.includes('yarn.lock')) packageManager = 'yarn';
        else if (rootEntries.includes('bun.lockb') || rootEntries.includes('bun.lock')) packageManager = 'bun';
      } catch {}

      return apiResponse({
        hasPackageJson: true,
        name: parsed.name || 'project',
        version: parsed.version || '1.0.0',
        packageManager,
        scripts,
        dependencyCount: dependencies.length + devDependencies.length,
      });
    } catch {
      // package.json doesn't exist or is invalid JSON
      return apiResponse({
        hasPackageJson: false,
        name: '',
        version: '',
        packageManager: 'npm',
        scripts: {},
        dependencyCount: 0,
      });
    }
  } catch (error: any) {
    console.error('Failed to get workspace scripts:', error);
    return apiError('Failed to get workspace scripts', 500, error.message);
  }
}
