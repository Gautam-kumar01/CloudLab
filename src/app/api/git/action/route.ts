import { auth } from '@/auth';
import { canAccessWorkspace } from '@/lib/workspace-auth';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { GitActionSchema } from '@/lib/validations/api';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = GitActionSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { workspaceId, action, file, message, branch } = parseResult.data;

    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }
    const hasAccess = await canAccessWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);

    // Helper to safely format file paths for CLI
    const safeFile = file ? `"${file.replace(/"/g, '\\"')}"` : '';

    let command = '';
    switch (action) {
      case 'init':
        command = 'git init && git add . && git commit -m "Initial commit"';
        break;
      case 'stage':
        command = `git add ${safeFile || '.'}`;
        break;
      case 'unstage':
        command = `git reset HEAD ${safeFile || ''}`;
        break;
      case 'commit':
        if (!message) return apiError('Missing commit message', 400);
        const safeMsg = message.replace(/"/g, '\\"');
        command = `git commit -m "${safeMsg}"`;
        break;
      case 'sync':
        command = 'git pull origin HEAD && git push origin HEAD';
        break;
      case 'checkout':
        if (!branch) return apiError('Missing branch name', 400);
        const safeBranch = branch.replace(/[^a-zA-Z0-9_\-\/]/g, '');
        command = `git checkout ${safeBranch}`;
        break;
      case 'create-branch':
        if (!branch) return apiError('Missing branch name', 400);
        const safeNewBranch = branch.replace(/[^a-zA-Z0-9_\-\/]/g, '');
        command = `git checkout -b ${safeNewBranch}`;
        break;
      case 'pull':
        command = `git pull`;
        break;
      default:
        return apiError('Unknown action', 400);
    }

    const { stdout, stderr } = await execPromise(command, { cwd: workspacePath });
    return apiResponse({ success: true, stdout, stderr });
  } catch (error: any) {
    console.error(`Git action failed:`, error);
    return apiError('Git operation failed', 500, error.message);
  }
}
