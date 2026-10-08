import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canAccessWorkspace } from '@/lib/workspace-auth';
import { apiError } from '@/lib/api-utils';
import { workspacePath } from '@/lib/workspace-paths';
import { promises as fs } from 'fs';
import path from 'path';
import http from 'http';

// Allowed development server ports for preview routing (blocks SSRF to internal services/DBs/Docker daemon)
export const ALLOWED_PREVIEW_PORTS = new Set([3000, 3001, 3002, 5173, 5174, 8000, 8080, 4200, 5000]);

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
  'cookie',
  'authorization',
  'proxy-authorization',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
]);

export const MAX_REQUEST_BODY_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_RESPONSE_BODY_BYTES = 15 * 1024 * 1024; // 15MB

export async function resolveWorkspaceInternalPort(workspaceId: string): Promise<number> {
  try {
    const root = workspacePath(workspaceId);
    const pkgPath = path.join(root, 'package.json');
    const pkgRaw = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
      return 5173;
    }
    if (pkg.dependencies?.next || pkg.devDependencies?.next) {
      return 3000;
    }
  } catch {}

  try {
    const root = workspacePath(workspaceId);
    await fs.access(path.join(root, 'main.py'));
    return 8000;
  } catch {}

  return 3000;
}

export function isLoopbackTarget(host: string): boolean {
  const normalized = host.toLowerCase().trim();
  return (
    normalized === '127.0.0.1' ||
    normalized === 'localhost' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.startsWith('127.') ||
    normalized.endsWith('.localhost')
  );
}

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

    // Check request payload size limit
    const contentLengthHeader = req.headers.get('content-length');
    if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_REQUEST_BODY_BYTES) {
      return apiError('Payload Too Large. Request exceeds maximum allowed 10MB limit.', 413);
    }

    // Server-side port resolution: NEVER allow client _port to probe host ports!
    const targetPort = await resolveWorkspaceInternalPort(workspaceId);

    // Target host resolution:
    // In production container environment, route to the dedicated workspace container
    const defaultContainerHost = `cloudlab-${workspaceId.toLowerCase()}-container`;
    const targetHost = process.env.CONTAINER_HOST || defaultContainerHost;

    // Reject loopback targets in production
    const isLoopback = isLoopbackTarget(targetHost);
    const allowLoopback =
      process.env.ALLOW_LOOPBACK_PREVIEW === 'true' ||
      (process.env.NODE_ENV !== 'production' && !process.env.PREVIEW_STRICT_ISOLATION);

    if (isLoopback && !allowLoopback) {
      return apiError('Forbidden. Direct host loopback preview routing is blocked for security.', 403);
    }

    // Strip internal _port parameter completely from query string
    const targetUrl = new URL(req.url);
    const cleanSearchParams = new URLSearchParams(targetUrl.search);
    cleanSearchParams.delete('_port');
    const searchString = cleanSearchParams.toString() ? `?${cleanSearchParams.toString()}` : '';

    const subpath = pathSegments ? '/' + pathSegments.join('/') : '/';
    const fullTargetPath = `${subpath}${searchString}`;

    // Read incoming request body if present
    const method = req.method;
    let bodyBuffer: Buffer | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      const arrayBuf = await req.arrayBuffer();
      if (arrayBuf.byteLength > MAX_REQUEST_BODY_BYTES) {
        return apiError('Payload Too Large. Request body exceeds 10MB limit.', 413);
      }
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
      let receivedBytes = 0;
      let limitExceeded = false;

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
          proxyRes.on('data', (chunk: Buffer) => {
            receivedBytes += chunk.length;
            if (receivedBytes > MAX_RESPONSE_BODY_BYTES) {
              limitExceeded = true;
              proxyReq.destroy();
            } else {
              chunks.push(chunk);
            }
          });

          proxyRes.on('end', () => {
            if (limitExceeded) {
              return resolve(
                NextResponse.json(
                  { error: 'Payload Too Large: Preview response exceeded maximum 15MB limit' },
                  { status: 413 }
                )
              );
            }

            const responseBody = Buffer.concat(chunks);
            const headers: Record<string, string> = {};

            for (const [key, val] of Object.entries(proxyRes.headers)) {
              const lowerKey = key.toLowerCase();
              if (!val || BLOCKED_RESPONSE_HEADERS.has(lowerKey)) {
                continue;
              }

              // Sanitize redirects (Location header)
              if (lowerKey === 'location') {
                const locStr = Array.isArray(val) ? val[0] : val;
                try {
                  const parsed = new URL(locStr, `http://${targetHost}:${targetPort}`);
                  headers['location'] = `/api/preview/${workspaceId}${parsed.pathname}${parsed.search}`;
                } catch {
                  if (locStr.startsWith('/') && !locStr.startsWith(`/api/preview/${workspaceId}`)) {
                    headers['location'] = `/api/preview/${workspaceId}${locStr}`;
                  } else {
                    headers['location'] = locStr;
                  }
                }
                continue;
              }

              headers[key] = Array.isArray(val) ? val.join(', ') : val;
            }

            // Enforce response isolation headers
            headers['x-content-type-options'] = 'nosniff';
            headers['content-security-policy'] = "frame-ancestors 'self'";
            headers['x-frame-options'] = 'SAMEORIGIN';

            resolve(new NextResponse(responseBody, { status: proxyRes.statusCode || 200, headers }));
          });
        }
      );

      proxyReq.on('error', (err) => {
        if (limitExceeded) {
          return resolve(
            NextResponse.json(
              { error: 'Payload Too Large: Preview response exceeded maximum 15MB limit' },
              { status: 413 }
            )
          );
        }

        resolve(
          NextResponse.json(
            {
              error: 'Workspace preview server not reachable',
              message: `No active server responding on container ${targetHost}:${targetPort}. Please verify your dev server is running.`,
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
