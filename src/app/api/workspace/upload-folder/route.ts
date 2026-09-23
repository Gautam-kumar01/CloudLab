import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { workspacePath, ensureWorkspacePath, workspaceFilePath } from '@/lib/workspace-paths';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { UploadFolderSchema } from '@/lib/validations/api';
import { runCommand } from '@/lib/process';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return apiError('Unauthorized. Please sign in to import folders.', 401);
    }

    const body = await req.json();
    const parseResult = UploadFolderSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { folderName, files } = parseResult.data;

    // Create DB Project record
    const project = await db.project.create({
      data: {
        name: folderName,
        description: `Imported desktop folder: ${folderName}`,
        ownerId: userId,
      },
    });

    const workspaceRoot = await ensureWorkspacePath(project.id);

    // Write all uploaded files
    let fileCount = 0;
    for (const file of files) {
      // Skip unwanted large/system files
      const normalizedPath = file.path.replace(/\\/g, '/');
      if (
        normalizedPath.startsWith('.git/') ||
        normalizedPath.includes('/.git/') ||
        normalizedPath.startsWith('node_modules/') ||
        normalizedPath.includes('/node_modules/') ||
        normalizedPath.startsWith('.next/') ||
        normalizedPath.includes('/.next/') ||
        normalizedPath.startsWith('dist/') ||
        normalizedPath.includes('/dist/')
      ) {
        continue;
      }

      try {
        const fullFilePath = workspaceFilePath(project.id, normalizedPath);
        await fs.mkdir(path.dirname(fullFilePath), { recursive: true });

        if (file.isBinary) {
          const buffer = Buffer.from(file.content, 'base64');
          await fs.writeFile(fullFilePath, buffer);
        } else {
          await fs.writeFile(fullFilePath, file.content, 'utf-8');
        }
        fileCount++;
      } catch (fileErr) {
        console.warn(`Skipping invalid path: ${file.path}`, fileErr);
      }
    }

    // Initialize git repository in the workspace
    try {
      await runCommand('git', ['init'], { cwd: workspaceRoot });
      await runCommand('git', ['config', 'user.name', session.user?.name || 'CloudLab Developer'], { cwd: workspaceRoot });
      await runCommand('git', ['config', 'user.email', session.user?.email || 'developer@cloudlab.dev'], { cwd: workspaceRoot });
      await runCommand('git', ['add', '-A'], { cwd: workspaceRoot });
      await runCommand('git', ['commit', '-m', `Initial import: ${folderName}`], { cwd: workspaceRoot });
    } catch (gitErr) {
      console.warn('Git initialization non-fatal error:', gitErr);
    }

    return apiResponse({
      success: true,
      project: {
        id: project.id,
        name: project.name,
      },
      fileCount,
    }, 201);
  } catch (error: any) {
    console.error('Error importing folder:', error);
    return apiError('Failed to import folder into workspace', 500, error.message);
  }
}
