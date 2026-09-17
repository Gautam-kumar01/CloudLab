import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { runCommand } from '@/lib/process';
import { workspacePath } from '@/lib/workspace-paths';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cloneUrl, name } = await req.json();
    if (!cloneUrl || !name) {
      return NextResponse.json({ error: 'Missing cloneUrl or name' }, { status: 400 });
    }
    let parsedUrl: URL;
    try { parsedUrl = new URL(cloneUrl); } catch { return NextResponse.json({ error: 'Invalid repository URL' }, { status: 400 }); }
    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'github.com') {
      return NextResponse.json({ error: 'Only HTTPS GitHub repositories are supported' }, { status: 400 });
    }

    // Check if project exists in database
    const existingProject = await db.project.findFirst({
      where: { name: name, ownerId: session.user.id },
    });

    const project = existingProject || await db.project.create({
        data: {
          name: name,
          description: `Cloned from ${cloneUrl}`,
          ownerId: session.user.id,
        },
      });
    const projectRoot = workspacePath(project.id);

    // Check if it already exists
    try {
      await fs.access(projectRoot);
      // If it exists, just return success
      return NextResponse.json({ success: true, message: 'Already exists' });
    } catch {
      // Doesn't exist, proceed to clone
    }

    // Run git clone
    await runCommand('git', ['clone', '--', cloneUrl, projectRoot], { timeout: 5 * 60 * 1000 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Clone error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
