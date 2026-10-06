import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { apiResponse, apiError } from '@/lib/api-utils';
import { workspacePath, workspaceFilePath } from '@/lib/workspace-paths';
import { runCommand } from '@/lib/process';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');
    const file = searchParams.get('file');

    if (!workspaceId || !file) {
      return apiError('Missing workspace id or file path', 400);
    }

    if (file.includes('\0') || file.startsWith('-') || file.includes('..')) {
      return apiError('Invalid file path', 400);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const hasAccess = await canEditWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const cwd = workspacePath(workspaceId);

    // Fetch original file content from HEAD
    let original = '';
    let isNew = false;
    try {
      const { stdout } = await runCommand('git', ['show', `HEAD:${file}`], { cwd });
      original = stdout;
    } catch (err: any) {
      // File not found in HEAD (new untracked or newly created file)
      isNew = true;
      original = '';
    }

    // Read current working file content
    let modified = '';
    let isDeleted = false;
    try {
      const workingPath = workspaceFilePath(workspaceId, file);
      modified = await fs.readFile(workingPath, 'utf-8');
    } catch {
      // File deleted from disk
      isDeleted = true;
      modified = '';
    }

    return apiResponse({
      file,
      original,
      modified,
      isNew,
      isDeleted,
    });
  } catch (error: any) {
    console.error('Git diff error:', error);
    return apiError('Failed to fetch git diff', 500, error.message);
  }
}
