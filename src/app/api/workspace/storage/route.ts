import { NextResponse } from 'next/server';
import { getDirectorySize, WORKSPACE_QUOTA_BYTES } from '@/lib/storage';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 });
  }

  const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);

  try {
    await fs.access(workspacePath);
  } catch {
    return NextResponse.json({ usedBytes: 0, quotaBytes: WORKSPACE_QUOTA_BYTES });
  }

  const usedBytes = await getDirectorySize(workspacePath);

  return NextResponse.json({
    usedBytes,
    quotaBytes: WORKSPACE_QUOTA_BYTES
  });
}
