import { NextRequest,  } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { builtInTemplates } from '@/lib/templates';
import { promises as fs } from 'fs';
import path from 'path';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { CreateProjectSchema } from '@/lib/validations/api';

// In-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 10; // Max 10 projects per IP
const WINDOW_MS = 60 * 1000; // Per 1 minute

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting Logic
    const ip = req.headers.get('x-forwarded-for') || 'anonymous_ip';
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + WINDOW_MS };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + WINDOW_MS;
    }

    if (record.count >= MAX_REQUESTS) {
      return apiError('Rate limit exceeded. Please wait a minute before creating more projects.', 429);
    }

    record.count += 1;
    rateLimitMap.set(ip, record);
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const parseResult = CreateProjectSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { name, template: templateId, description } = parseResult.data;

    // Find the template
    const template = builtInTemplates.find((t) => t.id === templateId) || builtInTemplates[0];

    // Create the project in the database
    const project = await db.project.create({
      data: {
        name,
        description: description || template.description,
        ownerId: session.user.id,
      },
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

    return apiResponse({ project }, 201);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return apiError('Failed to create project', 500, error.message);
  }
}
