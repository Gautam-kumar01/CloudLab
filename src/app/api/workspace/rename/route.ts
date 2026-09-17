import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canEditWorkspace, getWorkspaceProject } from '@/lib/workspace-auth';

import path from 'path';
import { workspaceFilePath, workspacePath } from '@/lib/workspace-paths';
import { promises as fs } from 'fs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, oldPath, newPath } = body;

    if (!workspaceId || !oldPath || !newPath) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const project = await getWorkspaceProject(session.user.id, workspaceId);
    if (!project || !(await canEditWorkspace(session.user.id, workspaceId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Strict Path Traversal Guard
    if (
      oldPath.includes('../') ||
      oldPath.includes('..\\') ||
      newPath.includes('../') ||
      newPath.includes('..\\')
    ) {
      return NextResponse.json(
        { error: 'Invalid file path: path traversal detected' },
        { status: 403 },
      );
    }

    const workspaceRoot = workspacePath(project.id);

    // Resolve absolute paths
    const absoluteOldPath = workspaceFilePath(project.id, oldPath);
    const absoluteNewPath = workspaceFilePath(project.id, newPath);

    // Security check to prevent path traversal
    if (!absoluteOldPath.startsWith(workspaceRoot) || !absoluteNewPath.startsWith(workspaceRoot)) {
      return NextResponse.json(
        { error: 'Invalid file path: path traversal detected' },
        { status: 403 },
      );
    }

    // Verify old path exists
    try {
      await fs.access(absoluteOldPath);
    } catch {
      return NextResponse.json({ error: 'Source file or folder not found' }, { status: 404 });
    }

    // Check if new path already exists
    try {
      await fs.access(absoluteNewPath);
      return NextResponse.json({ error: 'Destination already exists' }, { status: 409 });
    } catch {
      // It's expected that the new path does NOT exist
    }

    // Ensure parent directory of new path exists
    const dirPath = path.dirname(absoluteNewPath);
    await fs.mkdir(dirPath, { recursive: true });

    // Rename
    await fs.rename(absoluteOldPath, absoluteNewPath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error renaming file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
