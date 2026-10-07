import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessWorkspace } from '@/lib/workspace-auth';
import { apiError } from '@/lib/api-utils';
import http from 'http';

// Handle all HTTP methods for the preview proxy
export async function GET(req: NextRequest, context: { params: Promise<{ workspaceId: string; path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ workspaceId: string; path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ workspaceId: string; path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ workspaceId: string; path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ workspaceId: string; path?: string[] }> }) {
  return handleProxy(req, context);
}

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string; path?: string[] }> }
) {
  try {
    const { workspaceId, path: pathSegments } = await context.params;

    if (!workspaceId || !/^[a-zA-Z0-9_-]+$/.test(workspaceId)) {
      return apiError('Invalid workspace identifier', 400);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const hasAccess = await canAccessWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    // Touch activity for idle reaper
    try {
      const { DockerManager } = await import('@/lib/docker-manager');
      DockerManager.touchActivity(workspaceId);
    } catch {}

    const subpath = pathSegments ? '/' + pathSegments.join('/') : '/';
    const targetUrl = new URL(req.url);
    const searchString = targetUrl.search || '';

    // Determine target host and port
    // In Docker bridge, containers are accessible by containerName or mapped host port
    const port = targetUrl.searchParams.get('_port') ? parseInt(targetUrl.searchParams.get('_port')!, 10) : 3000;
    const targetHost = process.env.CONTAINER_HOST || '127.0.0.1';

    const fullTargetPath = `${subpath}${searchString}`;

    // Read incoming request body if present
    const method = req.method;
    let bodyBuffer: Buffer | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      const arrayBuf = await req.arrayBuffer();
      bodyBuffer = Buffer.from(arrayBuf);
    }

    return await new Promise<NextResponse>((resolve) => {
      const proxyReq = http.request(
        {
          host: targetHost,
          port,
          path: fullTargetPath,
          method,
          headers: {
            ...Object.fromEntries(req.headers.entries()),
            host: `${targetHost}:${port}`,
            'x-forwarded-for': req.headers.get('x-forwarded-for') || '127.0.0.1',
            'x-forwarded-proto': 'http',
          },
          timeout: 10000,
        },
        (proxyRes) => {
          const chunks: Buffer[] = [];
          proxyRes.on('data', (chunk) => chunks.push(chunk));
          proxyRes.on('end', () => {
            const responseBody = Buffer.concat(chunks);
            const headers: Record<string, string> = {};
            for (const [key, val] of Object.entries(proxyRes.headers)) {
              if (val) {
                headers[key] = Array.isArray(val) ? val.join(', ') : val;
              }
            }
            resolve(new NextResponse(responseBody, { status: proxyRes.statusCode || 200, headers }));
          });
        }
      );

      proxyReq.on('error', (err) => {
        resolve(
          NextResponse.json(
            {
              error: 'Workspace preview server not reachable',
              message: `No active server responding on port ${port}. Please run your dev server (e.g. 'npm run dev') in the terminal.`,
              details: err.message,
            },
            { status: 502 }
          )
        );
      });

      if (bodyBuffer && bodyBuffer.length > 0) {
        proxyReq.write(bodyBuffer);
      }
      proxyReq.end();
    });
  } catch (error: any) {
    console.error('Preview proxy error:', error);
    return apiError('Preview proxy internal error', 500, error.message);
  }
}
