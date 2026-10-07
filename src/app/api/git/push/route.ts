
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
    const { getGitAuthArgs, scrubGitRemoteCredentials } = await import('@/lib/git-security');
    await scrubGitRemoteCredentials(cwd);

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

    // Resolve GitHub Token: session, DB accounts, or fallback env
    let token = (session as any)?.accessToken || process.env.GITHUB_TOKEN;
    if (!token && session.user?.id) {
      try {
        const { db } = await import('@/lib/db');
        const userWithAccount = await db.user.findUnique({
          where: { id: session.user.id },
          include: { accounts: true },
        });
        const ghAccount = userWithAccount?.accounts?.find((a: any) => a.provider === 'github');
        token = ghAccount?.access_token || null;
      } catch {}
    }

    // Execute ephemeral authenticated git push
    const authArgs = token ? getGitAuthArgs(token) : [];
    const { stdout } = await runCommand('git', [...authArgs, 'push'], { cwd });
    await scrubGitRemoteCredentials(cwd);

    return apiResponse({ success: true, stdout });
  } catch (error: any) {
    console.error('Git push error:', error);
    return apiError('Git operation failed', 500, error.message);
  }
}
