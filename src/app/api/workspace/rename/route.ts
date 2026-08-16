import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, oldPath, newPath } = body;

    if (!workspaceId || !oldPath || !newPath) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);
    
    // Resolve absolute paths
    const absoluteOldPath = path.resolve(workspacePath, oldPath);
    const absoluteNewPath = path.resolve(workspacePath, newPath);

    // Security check to prevent path traversal
    if (!absoluteOldPath.startsWith(workspacePath) || !absoluteNewPath.startsWith(workspacePath)) {
      return NextResponse.json({ error: 'Invalid file path: path traversal detected' }, { status: 403 });
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
