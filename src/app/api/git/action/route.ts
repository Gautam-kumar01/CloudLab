import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { GitActionSchema } from '@/lib/validations/api';
import { workspacePath } from '@/lib/workspace-paths';
import { runCommand } from '@/lib/process';

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
    const hasAccess = await canEditWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const cwd = workspacePath(workspaceId);
    if (file && (file.includes('\0') || file.startsWith('-'))) return apiError('Invalid file path', 400);
    const args: string[] = [];
    switch (action) {
      case 'init':
        await runCommand('git', ['init'], { cwd });
        await runCommand('git', ['add', '--', '.'], { cwd });
        args.push('commit', '-m', 'Initial commit');
        break;
      case 'stage':
        args.push('add', '--', file || '.');
        break;
      case 'unstage':
        args.push('reset', 'HEAD', '--', file || '.');
        break;
      case 'commit':
        if (!message) return apiError('Missing commit message', 400);
        args.push('commit', '-m', message);
        break;
      case 'sync':
        await runCommand('git', ['pull', '--ff-only', 'origin', 'HEAD'], { cwd });
        args.push('push', 'origin', 'HEAD');
        break;
      case 'checkout':
        if (!branch) return apiError('Missing branch name', 400);
        if (!/^[A-Za-z0-9._/-]+$/.test(branch)) return apiError('Invalid branch name', 400);
        args.push('checkout', '--', branch);
        break;
      case 'create-branch':
        if (!branch) return apiError('Missing branch name', 400);
        if (!/^[A-Za-z0-9._/-]+$/.test(branch)) return apiError('Invalid branch name', 400);
        args.push('checkout', '-b', branch);
        break;
      case 'pull':
        args.push('pull', '--ff-only');
        break;
      default:
        return apiError('Unknown action', 400);
    }

    const { stdout, stderr } = await runCommand('git', args, { cwd });
    return apiResponse({ success: true, stdout, stderr });
  } catch (error: any) {
    console.error(`Git action failed:`, error);
    return apiError('Git operation failed', 500, error.message);
  }
}
