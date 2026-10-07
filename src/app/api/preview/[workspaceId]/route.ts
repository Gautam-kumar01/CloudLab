import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessWorkspace } from '@/lib/workspace-auth';
import { apiError } from '@/lib/api-utils';
import http from 'http';

// Allowed development server ports for preview routing (blocks SSRF to internal services/DBs/Docker daemon)
const ALLOWED_PREVIEW_PORTS = new Set([3000, 3001, 3002, 5173, 5174, 8000, 8080, 4200, 5000]);

// Safe headers to forward upstream to the workspace preview application
const ALLOWED_FORWARD_REQUEST_HEADERS = [
  'accept',
  'accept-encoding',
  'accept-language',
  'content-type',
  'user-agent',
  'referer',
  'range',
  'if-none-match',
  'if-modified-since',
];

// Dangerous headers that must never be mirrored back to the browser from untrusted preview apps
const BLOCKED_RESPONSE_HEADERS = new Set([
  'set-cookie',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
]);

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

    const targetUrl = new URL(req.url);

    // Validate and restrict target port to prevent internal port scanning & SSRF
    const rawPortStr = targetUrl.searchParams.get('_port');
    let targetPort = 3000;
    if (rawPortStr) {
      const parsedPort = parseInt(rawPortStr, 10);
      if (isNaN(parsedPort) || !ALLOWED_PREVIEW_PORTS.has(parsedPort)) {
        return apiError('Forbidden. Port is not an authorized web preview port.', 403);
      }
      targetPort = parsedPort;
    }

    // Strip internal _port parameter from downstream URL
    const cleanSearchParams = new URLSearchParams(targetUrl.search);
    cleanSearchParams.delete('_port');
    const searchString = cleanSearchParams.toString() ? `?${cleanSearchParams.toString()}` : '';

    const subpath = pathSegments ? '/' + pathSegments.join('/') : '/';
    const fullTargetPath = `${subpath}${searchString}`;

    const targetHost = process.env.CONTAINER_HOST || '127.0.0.1';

    // Read incoming request body if present
    const method = req.method;
    let bodyBuffer: Buffer | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      const arrayBuf = await req.arrayBuffer();
      bodyBuffer = Buffer.from(arrayBuf);
    }

    // Build stripped headers: NEVER forward session cookies or authorization tokens
    const forwardHeaders: Record<string, string> = {
      host: `${targetHost}:${targetPort}`,
      'x-forwarded-proto': 'http',
      'x-forwarded-host': req.headers.get('host') || `${targetHost}:${targetPort}`,
    };

    for (const headerName of ALLOWED_FORWARD_REQUEST_HEADERS) {
      const val = req.headers.get(headerName);
      if (val) {
        forwardHeaders[headerName] = val;
      }
    }

    return await new Promise<NextResponse>((resolve) => {
      const proxyReq = http.request(
        {
          host: targetHost,
          port: targetPort,
          path: fullTargetPath,
          method,
          headers: forwardHeaders,
          timeout: 10000,
        },
        (proxyRes) => {
          const chunks: Buffer[] = [];
          proxyRes.on('data', (chunk) => chunks.push(chunk));
          proxyRes.on('end', () => {
            const responseBody = Buffer.concat(chunks);
            const headers: Record<string, string> = {};

            for (const [key, val] of Object.entries(proxyRes.headers)) {
              const lowerKey = key.toLowerCase();
              // Strip cookies and hop-by-hop headers from previewed application
              if (val && !BLOCKED_RESPONSE_HEADERS.has(lowerKey)) {
                headers[key] = Array.isArray(val) ? val.join(', ') : val;
              }
            }

            // Enforce response isolation headers
            headers['x-content-type-options'] = 'nosniff';
            headers['content-security-policy'] = "frame-ancestors 'self'";

            resolve(new NextResponse(responseBody, { status: proxyRes.statusCode || 200, headers }));
          });
        }
      );

      proxyReq.on('error', (err) => {
        resolve(
          NextResponse.json(
            {
              error: 'Workspace preview server not reachable',
              message: `No active server responding on port ${targetPort}. Please run your dev server (e.g. 'npm run dev') in the terminal.`,
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
