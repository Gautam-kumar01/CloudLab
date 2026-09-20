import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessWorkspace, getWorkspaceProject } from '@/lib/workspace-auth';
import { apiError } from '@/lib/api-utils';

import { promises as fs } from 'fs';
import path from 'path';
import { workspaceFilePath, workspacePath } from '@/lib/workspace-paths';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');
  const filename = searchParams.get('filename');

  if (!workspaceId || !filename) {
    return apiError('Missing workspace id or filename', 400);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return apiError('Unauthorized', 401);
  }

  const project = await getWorkspaceProject(session.user.id, workspaceId);
  if (!project || !(await canAccessWorkspace(session.user.id, workspaceId))) {
    return apiError('Forbidden', 403);
  }

  try {
    const workspaceRoot = workspacePath(project.id);
    const filePath = workspaceFilePath(project.id, filename);

    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ content: '', error: 'File not found' }, { status: 404 });
    }
    console.error('Error reading file content:', error);
    return apiError('Failed to read file content', 500, error.message);
  }
}
