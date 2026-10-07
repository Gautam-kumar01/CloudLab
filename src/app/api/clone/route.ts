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
    let accessToken: string | null = null;
    if (session.user?.id) {
      try {
        const account = await db.account.findFirst({
          where: { userId: session.user.id, provider: 'github' },
        });
        accessToken = account?.access_token || null;
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

    // Clean destination directory if it exists but is empty
    try {
      await fs.rm(projectRoot, { recursive: true, force: true });
    } catch {}

    // Execute git clone using ephemeral HTTP Authorization header to prevent token leakage in .git/config
    const gitArgs: string[] = [];
    if (accessToken && parsedUrl.hostname === 'github.com') {
      const basicAuth = Buffer.from(`x-access-token:${accessToken}`).toString('base64');
      gitArgs.push('-c', `http.extraHeader=AUTHORIZATION: basic ${basicAuth}`);
    }
    gitArgs.push('clone', '--depth', '1', '--', cloneUrl, projectRoot);

    try {
      await runCommand('git', gitArgs, { timeout: 3 * 60 * 1000 });
    } finally {
      // Always scrub origin remote credentials as a defense-in-depth measure
      try {
        const { scrubGitRemoteCredentials } = await import('@/lib/git-security');
        await scrubGitRemoteCredentials(projectRoot);
      } catch {}
    }

    return NextResponse.json({ success: true, projectId: project.id });
  } catch (err: any) {
    console.error('Clone error:', err);
    // Redact any tokens or credentials before returning error message to client
    const rawMsg = err.message || 'Failed to clone repository';
    const sanitizedMsg = rawMsg
      .replace(/https:\/\/[^@\s]+@/g, 'https://***@')
      .replace(/ghp_[a-zA-Z0-9]+/g, '***')
      .replace(/x-access-token:[a-zA-Z0-9_.-]+/g, 'x-access-token:***');

    return NextResponse.json(
      { error: sanitizedMsg },
      { status: 500 }
    );
  }
}
