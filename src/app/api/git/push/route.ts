import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const { workspaceId, message } = await request.json();

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);
    
    // Execute git add
    await execPromise('git add .', { cwd: workspacePath });
    
    // Execute git commit
    const commitMsg = message || 'Update from CloudLab';
    try {
      await execPromise(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: workspacePath });
    } catch (e: any) {
      // If nothing to commit, just proceed
      if (!e.stdout?.includes('nothing to commit')) {
        throw e;
      }
    }
    
    // Execute git push
    const { stdout, stderr } = await execPromise('git push', { cwd: workspacePath });

    return NextResponse.json({ success: true, message: stdout || stderr });
  } catch (error: any) {
    console.error('Git push failed:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
