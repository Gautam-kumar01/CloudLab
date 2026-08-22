import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessWorkspace } from '@/lib/workspace-auth';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { GitPushSchema } from '@/lib/validations/api';

import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

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
    const hasAccess = await canAccessWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);

    // Execute git add
    await execPromise('git add .', { cwd: workspacePath });

    // Execute git commit
    const commitMsg = message || 'Update from CloudLab';
    try {
      await execPromise(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, {
        cwd: workspacePath,
      });
    } catch (e: any) {
      // If nothing to commit, just proceed
      if (!e.stdout?.includes('nothing to commit')) {
        throw e;
      }
    }

    // Execute git push
    const { stdout } = await execPromise('git push', { cwd: workspacePath });

    return apiResponse({ success: true, stdout });
  } catch (error: any) {
    console.error('Git push error:', error);
    return apiError('Git operation failed', 500, error.message);
  }
}
