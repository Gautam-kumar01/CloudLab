import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, action, file, message, branch } = body;

    if (!workspaceId || !action) {
      return NextResponse.json({ error: 'Missing workspaceId or action' }, { status: 400 });
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
        if (!message) return NextResponse.json({ error: 'Missing commit message' }, { status: 400 });
        const safeMsg = message.replace(/"/g, '\\"');
        command = `git commit -m "${safeMsg}"`;
        break;
      case 'sync':
        command = 'git pull origin HEAD && git push origin HEAD';
        break;
      case 'checkout':
        if (!branch) return NextResponse.json({ error: 'Missing branch name' }, { status: 400 });
        const safeBranch = branch.replace(/[^a-zA-Z0-9_\-\/]/g, '');
        command = `git checkout ${safeBranch}`;
        break;
      case 'create-branch':
        if (!branch) return NextResponse.json({ error: 'Missing branch name' }, { status: 400 });
        const safeNewBranch = branch.replace(/[^a-zA-Z0-9_\-\/]/g, '');
        command = `git checkout -b ${safeNewBranch}`;
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const { stdout, stderr } = await execPromise(command, { cwd: workspacePath });
    return NextResponse.json({ success: true, stdout, stderr });
  } catch (error: any) {
    console.error(`Git action failed:`, error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
