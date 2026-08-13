import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');
  const filename = searchParams.get('filename');

  if (!workspaceId || !filename) {
    return NextResponse.json({ error: 'Missing workspace id or filename' }, { status: 400 });
  }

  // Security check
  if (filename.includes('..')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const workspacePath = path.join(process.cwd(), 'workspaces', workspaceId);
  const filePath = path.join(workspacePath, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Error reading file content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
