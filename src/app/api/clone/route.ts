import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { runCommand } from '@/lib/process';
import { workspacePath, ensureWorkspacePath } from '@/lib/workspace-paths';

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
    try {
      parsedUrl = new URL(cloneUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid repository URL' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'github.com') {
      return NextResponse.json({ error: 'Only HTTPS GitHub repositories are supported' }, { status: 400 });
    }

    // Sanitize repository name for DB and path
    const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]/g, '-').slice(0, 64);

    // Retrieve user's GitHub OAuth access token for private repo clone support
    let accessToken = (session as any)?.accessToken;
    if (!accessToken && session.user?.id) {
      try {
        const account = await db.account.findFirst({
          where: { userId: session.user.id, provider: 'github' },
        });
        accessToken = account?.access_token;
      } catch (e) {
        console.warn('Could not fetch account access token:', e);
      }
    }

    // Check if project exists in database for this owner
    const existingProject = await db.project.findFirst({
      where: { name: sanitizedName, ownerId: session.user.id },
    });

    const project =
      existingProject ||
      (await db.project.create({
        data: {
          name: sanitizedName,
          description: `Cloned from ${cloneUrl}`,
          ownerId: session.user.id,
        },
      }));

    const projectRoot = workspacePath(project.id);
    await ensureWorkspacePath(project.id);

    // Check if workspace directory already exists with files
    try {
      await fs.access(projectRoot);
      const existingFiles = await fs.readdir(projectRoot);
      if (existingFiles.length > 0) {
        return NextResponse.json({ success: true, projectId: project.id, message: 'Already exists' });
      }
    } catch {
      // Directory doesn't exist or is empty, proceed to clone
    }

    // Build authenticated clone URL
    let targetCloneUrl = cloneUrl;
    if (accessToken && parsedUrl.hostname === 'github.com') {
      const repoPath = parsedUrl.pathname.replace(/^\//, '');
      targetCloneUrl = `https://x-access-token:${accessToken}@github.com/${repoPath}`;
    }

    // Clean destination directory if it exists but is empty
    try {
      await fs.rm(projectRoot, { recursive: true, force: true });
    } catch {}

    // Execute git clone
    await runCommand(
      'git',
      ['clone', '--depth', '1', '--', targetCloneUrl, projectRoot],
      { timeout: 3 * 60 * 1000 }
    );

    return NextResponse.json({ success: true, projectId: project.id });
  } catch (err: any) {
    console.error('Clone error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to clone repository' },
      { status: 500 }
    );
  }
}
