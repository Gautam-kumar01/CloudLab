import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 });
  }

  const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);

  try {
    // Check if it's a git repo
    try {
      await execPromise('git rev-parse --is-inside-work-tree', { cwd: workspacePath });
    } catch {
      return NextResponse.json({ isRepo: false });
    }

    // Get current branch
    let currentBranch = '';
    try {
      const { stdout: branchOut } = await execPromise('git branch --show-current', { cwd: workspacePath });
      currentBranch = branchOut.trim();
    } catch {
      currentBranch = 'unknown';
    }

    // Get status
    const { stdout: statusOut } = await execPromise('git status -s', { cwd: workspacePath });
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
