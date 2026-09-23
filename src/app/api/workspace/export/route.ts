import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { workspacePath } from '@/lib/workspace-paths';
import { promises as fs } from 'fs';
import path from 'path';
const archiver = require('archiver');
import { PassThrough } from 'stream';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = await canEditWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const root = workspacePath(workspaceId);
    try {
      await fs.access(root);
    } catch {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const passThrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      console.error('Archive error:', err);
      passThrough.destroy(err);
    });

    archive.pipe(passThrough);

    // Append files, ignoring .git and heavy node_modules
    archive.glob('**/*', {
      cwd: root,
      ignore: ['.git/**', 'node_modules/**', '.next/**', 'dist/**'],
      dot: true,
    });

    archive.finalize();

    // Convert PassThrough to web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      },
      cancel() {
        passThrough.destroy();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${workspaceId}-export.zip"`,
      },
    });
  } catch (error: any) {
    console.error('Export workspace error:', error);
    return NextResponse.json({ error: 'Failed to export workspace' }, { status: 500 });
  }
}
