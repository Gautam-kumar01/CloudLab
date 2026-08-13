import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { cloneUrl, name } = await req.json();
    if (!cloneUrl || !name) {
      return NextResponse.json({ error: 'Missing cloneUrl or name' }, { status: 400 });
    }

    const workspacePath = path.join(process.cwd(), 'workspaces', name);

    // Check if it already exists
    try {
      await fs.access(workspacePath);
      // If it exists, just return success
      return NextResponse.json({ success: true, message: 'Already exists' });
    } catch {
      // Doesn't exist, proceed to clone
    }

    // Run git clone
    await execAsync(`git clone ${cloneUrl} ${workspacePath}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Clone error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
