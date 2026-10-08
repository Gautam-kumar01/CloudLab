import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWorkspaceProject } from '@/lib/workspace-auth';

import { promises as fs } from 'fs';
import path from 'path';
import { workspaceFilePath, workspacePath, assertSafeRealPath } from '@/lib/workspace-paths';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');
  const filename = searchParams.get('filename');

  if (!workspaceId || !filename) {
    return new NextResponse('Missing workspace id or filename', { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { canAccessWorkspace } = await import('@/lib/workspace-auth');
  const hasAccess = await canAccessWorkspace(session.user.id, workspaceId);
  if (!hasAccess) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const filePath = workspaceFilePath(workspaceId, filename);
    await assertSafeRealPath(workspaceId, filePath);

    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      return new NextResponse('Cannot directly download a directory', { status: 400 });
    }

    if (stat.size > 100 * 1024 * 1024) {
      return new NextResponse('File too large for direct download (max 100MB)', { status: 413 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const cleanFilename = path.basename(filePath).replace(/["\r\n]/g, '');

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error downloading file:', error);
    return new NextResponse('File not found or unreadable', { status: 404 });
  }
}
