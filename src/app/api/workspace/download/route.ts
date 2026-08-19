import { NextResponse } from 'next/server';
import { promises as fs, createReadStream } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');
  const filename = searchParams.get('filename');

  if (!workspaceId || !filename) {
    return new NextResponse('Missing workspace id or filename', { status: 400 });
  }

  const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);
  const filePath = path.resolve(workspacePath, filename);

  // Security check to prevent path traversal
  if (!filePath.startsWith(workspacePath)) {
    return new NextResponse('Invalid file path', { status: 403 });
  }

  try {
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      return new NextResponse('Cannot directly download a directory', { status: 400 });
    }

    // Use Web Streams API to stream the file instead of Node stream to support Edge/App router better natively
    // Read the file as a buffer for the MVP as it's safe for 50MB files. 
    // For gigabyte files we would want a proper ReadableStream.
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
      }
    });

  } catch (error: any) {
    console.error('Error downloading file:', error);
    return new NextResponse('File not found or unreadable', { status: 404 });
  }
}
