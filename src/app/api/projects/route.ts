import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { builtInTemplates } from '@/lib/templates';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, templateId, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Find the template
    const template = builtInTemplates.find(t => t.id === templateId) || builtInTemplates[0];

    // Create the project in the database
    const project = await db.project.create({
      data: {
        name,
        description: description || template.description,
        ownerId: session.user.id,
      }
    });

    // Create workspace directory
    const workspacePath = path.join(process.cwd(), 'workspaces', project.name); // Using project.name instead of ID to match the Dockerfile logic from Phase 14
    
    // Ensure the workspaces directory exists
    await fs.mkdir(path.join(process.cwd(), 'workspaces'), { recursive: true });

    try {
      await fs.access(workspacePath);
    } catch {
      await fs.mkdir(workspacePath, { recursive: true });
    }

    // Write template files
    for (const [filename, content] of Object.entries(template.files)) {
      const filePath = path.join(workspacePath, filename);
      // Ensure subdirectories exist if the template has nested files
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
