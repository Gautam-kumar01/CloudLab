import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessWorkspace } from '@/lib/workspace-auth';
import { workspacePath } from '@/lib/workspace-paths';
import { runCommand } from '@/lib/process';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 });
  }
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await canAccessWorkspace(session.user.id, workspaceId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const cwd = workspacePath(workspaceId);

  try {
    // Check if it's a git repo
    try {
      await runCommand('git', ['rev-parse', '--is-inside-work-tree'], { cwd });
    } catch {
      return NextResponse.json({ isRepo: false });
    }

    // Get current branch
    let currentBranch = '';
    try {
      const { stdout: branchOut } = await runCommand('git', ['branch', '--show-current'], { cwd });
      currentBranch = branchOut.trim();
    } catch {
      currentBranch = 'unknown';
    }

    // Get status
    const { stdout: statusOut } = await runCommand('git', ['status', '--short'], { cwd });
    const lines = statusOut.split('\n').filter(l => l.trim() !== '');
    
    const staged: { file: string, state: string }[] = [];
    const unstaged: { file: string, state: string }[] = [];

    lines.forEach(line => {
      // line is like " M file.txt" or "?? file.txt"
      const x = line[0]; // Staged status
      const y = line[1]; // Unstaged status
      const file = line.substring(3).trim();

      // If X is not space and not ?, it's staged
      if (x !== ' ' && x !== '?') {
        staged.push({ file, state: x });
      }

      // If Y is not space, it's unstaged
      // ?? is untracked, which counts as unstaged
      if (y !== ' ' || x === '?') {
        unstaged.push({ file, state: y === ' ' ? '?' : y });
      }
    });

    return NextResponse.json({
      isRepo: true,
      currentBranch,
      staged,
      unstaged
    });
  } catch (error: any) {
    console.error('Git status failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
