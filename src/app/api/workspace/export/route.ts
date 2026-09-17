import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWorkspaceProject } from '@/lib/workspace-auth';
const archiver = require('archiver');



import { promises as fs } from 'fs';
import { workspacePath } from '@/lib/workspace-paths';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 });
  }
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project = await getWorkspaceProject(session.user.id, workspaceId);
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const workspaceRoot = workspacePath(project.id);

  // Ensure workspace exists
  try {
    await fs.access(workspaceRoot);
  } catch {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Create an Archiver instance
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level
  });

  // Create a Transform stream so we can stream the response directly
  const stream = new ReadableStream({
    start(controller) {
      archive.on('data', (chunk: any) => controller.enqueue(chunk));
      archive.on('end', () => controller.close());
      archive.on('error', (err: any) => controller.error(err));

      // Append files from the workspace directory, putting them in the root of the archive
      archive.directory(workspaceRoot, false);

      // Finalize the archive (we are done appending files)
      archive.finalize();
    },
  });

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${workspaceId}-export.zip"`,
    },
  });
}
