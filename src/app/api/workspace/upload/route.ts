import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canEditWorkspace, getWorkspaceProject } from '@/lib/workspace-auth';

import { promises as fs } from 'fs';
import path from 'path';
import { workspacePath } from '@/lib/workspace-paths';
import { checkQuota } from '@/lib/storage';



export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');
    const folderPath = searchParams.get('path') || '';

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 });
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
    if (folderPath && (folderPath.includes('../') || folderPath.includes('..\\'))) {
      return NextResponse.json(
        { error: 'Invalid file path: path traversal detected' },
        { status: 403 },
      );
    }

    const workspaceRoot = workspacePath(project.id);

    // Read multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Safety checks
    const targetFilePath = path.resolve(workspaceRoot, folderPath, file.name);
    if (!targetFilePath.startsWith(`${workspaceRoot}${path.sep}`)) {
      return NextResponse.json({ error: 'Invalid path traversal detected' }, { status: 403 });
    }

    // Check quota
    const quota = await checkQuota(workspaceRoot, file.size);
    if (!quota.ok) {
      return NextResponse.json(
        {
          error: `Storage quota exceeded. Cannot upload ${Math.round(file.size / 1024 / 1024)}MB file.`,
        },
        { status: 403 },
      );
    }

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure parent directory exists
    await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
    await fs.writeFile(targetFilePath, buffer);

    return NextResponse.json({
      success: true,
      filename: file.name,
      path: targetFilePath.replace(workspaceRoot + path.sep, ''),
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
