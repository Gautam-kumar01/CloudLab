import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { workspacePath } from '@/lib/workspace-paths';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { GithubPublishSchema } from '@/lib/validations/api';
import { runCommand } from '@/lib/process';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return apiError('Unauthorized. Please sign in.', 401);
    }

    const body = await req.json();
    const parseResult = GithubPublishSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { workspaceId, repoName, description, isPrivate, githubToken } = parseResult.data;

    const hasAccess = await canEditWorkspace(userId, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    // Resolve GitHub Token: either from session or provided PAT
    const token = githubToken || (session as any)?.accessToken || process.env.GITHUB_TOKEN;
    if (!token) {
      return apiError(
        'GitHub authentication required. Please sign in with GitHub or provide a Personal Access Token with repo scope.',
        400
      );
    }

    // 1. Create Repository on GitHub via REST API
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'CloudLab-Cloud-IDE',
      },
      body: JSON.stringify({
        name: repoName,
        description: description || 'Created with CloudLab Web IDE',
        private: isPrivate,
        auto_init: false,
      }),
    });

    if (!createRepoRes.ok) {
      const errorData = await createRepoRes.json().catch(() => ({}));
      const errorMsg = errorData.message || (errorData.errors?.[0]?.message) || 'Failed to create repository on GitHub';
      return apiError(`GitHub API Error: ${errorMsg}`, createRepoRes.status);
    }

    const repoData = await createRepoRes.json();
    const htmlUrl = repoData.html_url;
    const cloneUrl = repoData.clone_url;
    const authCloneUrl = cloneUrl.replace('https://', `https://${encodeURIComponent(token)}@`);

    const cwd = workspacePath(workspaceId);

    // 2. Configure Git, add remote, commit and push
    try {
      // Ensure git init
      await runCommand('git', ['init'], { cwd });

      // User config
      await runCommand('git', ['config', 'user.name', session.user?.name || 'CloudLab Developer'], { cwd });
      await runCommand('git', ['config', 'user.email', session.user?.email || 'developer@cloudlab.dev'], { cwd });

      // Configure Remote
      try {
        await runCommand('git', ['remote', 'remove', 'origin'], { cwd });
      } catch {}
      await runCommand('git', ['remote', 'add', 'origin', authCloneUrl], { cwd });

      // Set default branch to main
      await runCommand('git', ['branch', '-M', 'main'], { cwd });

      // Stage and commit
      await runCommand('git', ['add', '-A'], { cwd });
      try {
        await runCommand('git', ['commit', '-m', 'Initial commit from CloudLab'], { cwd });
      } catch (commitErr: any) {
        if (!commitErr.stdout?.includes('nothing to commit')) {
          console.warn('Commit warning:', commitErr);
        }
      }

      // Push to GitHub
      await runCommand('git', ['push', '-u', 'origin', 'main', '--force'], { cwd });

    } catch (gitErr: any) {
      console.error('Git push to GitHub error:', gitErr);
      return apiError(`Repository created at ${htmlUrl}, but initial push failed: ${gitErr.message}`, 500);
    }

    return apiResponse({
      success: true,
      repoUrl: htmlUrl,
      cloneUrl,
      repoName: repoData.full_name,
    });
  } catch (error: any) {
    console.error('GitHub publish error:', error);
    return apiError('Failed to publish project to GitHub', 500, error.message);
  }
}
