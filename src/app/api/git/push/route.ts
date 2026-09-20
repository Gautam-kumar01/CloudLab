
import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { GitPushSchema } from '@/lib/validations/api';

import { workspacePath } from '@/lib/workspace-paths';
import { runCommand } from '@/lib/process';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = GitPushSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { workspaceId, message } = parseResult.data;

    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }
    const hasAccess = await canEditWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const cwd = workspacePath(workspaceId);

    // Ensure git author is configured
    try {
      await runCommand('git', ['config', 'user.name'], { cwd });
    } catch {
      await runCommand('git', ['config', 'user.name', session.user.name || 'CloudLab Developer'], { cwd });
      await runCommand('git', ['config', 'user.email', session.user.email || 'developer@cloudlab.dev'], { cwd });
    }

    // Execute git add
    await runCommand('git', ['add', '--', '.'], { cwd });

    // Execute git commit
    const commitMsg = message || 'Update from CloudLab';
    try {
      await runCommand('git', ['commit', '-m', commitMsg], { cwd });
    } catch (e: any) {
      // If nothing to commit, just proceed
      if (!e.stdout?.includes('nothing to commit')) {
        throw e;
      }
    }

    // Execute git push
    const { stdout } = await runCommand('git', ['push'], { cwd });

    return apiResponse({ success: true, stdout });
  } catch (error: any) {
    console.error('Git push error:', error);
    return apiError('Git operation failed', 500, error.message);
  }
}
