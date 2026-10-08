import http from 'node:http';
import https from 'node:https';
import { parse as parseUrl } from 'node:url';

export interface PreviewRoutingInfo {
  workspaceId: string;
  targetPort: number;
  containerName: string;
  subdomainUrl: string;
  pathUrl: string;
  displayUrl: string;
}

const PREVIEW_BASE_DOMAIN = process.env.PREVIEW_BASE_DOMAIN || 'preview.localhost:3000';

/**
 * Resolves preview routing details for a given workspace and port.
 */
export function getPreviewRouting(workspaceId: string, targetPort: number = 3000): PreviewRoutingInfo {
  const containerName = `cloudlab-${workspaceId.toLowerCase()}-container`;
  const subdomainUrl = `http://${workspaceId}.${PREVIEW_BASE_DOMAIN}`;
  const pathUrl = `/api/preview/${workspaceId}/`;

  // If PREVIEW_USE_SUBDOMAINS is enabled or in production, prefer subdomain, otherwise provide pathUrl
  const useSubdomain = process.env.PREVIEW_USE_SUBDOMAINS === 'true';
  const displayUrl = useSubdomain ? subdomainUrl : pathUrl;

  return {
    workspaceId,
    targetPort,
    containerName,
    subdomainUrl,
    pathUrl,
    displayUrl,
  };
}

/**
 * Generates dynamic Caddy reverse-proxy configuration for all running CloudLab containers.
 */
export function generateCaddyConfig(
  routes: Array<{ workspaceId: string; targetPort: number; containerName: string }>
): string {
  const baseDomain = PREVIEW_BASE_DOMAIN;
  const blocks = routes.map(({ workspaceId, targetPort, containerName }) => {
    return `${workspaceId}.${baseDomain} {
    reverse_proxy ${containerName}:${targetPort}
}`;
  });

  return `# Auto-generated CloudLab Caddy Configuration\n${blocks.join('\n\n')}\n`;
}

/**
 * Generates dynamic Traefik configuration (File Provider format) for running containers.
 */
export function generateTraefikConfig(
  routes: Array<{ workspaceId: string; targetPort: number; containerName: string }>
): Record<string, any> {
  const baseDomain = PREVIEW_BASE_DOMAIN;
  const routers: Record<string, any> = {};
  const services: Record<string, any> = {};

  for (const { workspaceId, targetPort, containerName } of routes) {
    const routerName = `cloudlab-${workspaceId}`;
    routers[routerName] = {
      rule: `Host(\`${workspaceId}.${baseDomain}\`)`,
      service: routerName,
      entryPoints: ['web'],
    };
    services[routerName] = {
      loadBalancer: {
        servers: [{ url: `http://${containerName}:${targetPort}` }],
      },
    };
  }

  return {
    http: {
      routers,
      services,
    },
  };
}

/**
 * Ephemeral reverse-proxy for incoming HTTP requests to target container or port.
 */
export function proxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  targetHost: string,
  targetPort: number,
  pathRewrite?: (url: string) => string
): void {
  const originalUrl = req.url || '/';
  const targetPath = pathRewrite ? pathRewrite(originalUrl) : originalUrl;

  const options: http.RequestOptions = {
    host: targetHost,
    port: targetPort,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${targetHost}:${targetPort}`,
      'x-forwarded-host': req.headers.host || '',
      'x-forwarded-proto': 'http',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Bad Gateway: Workspace dev server is not responding on port ' + targetPort,
          details: err.message,
        })
      );
    }
  });

  req.pipe(proxyReq, { end: true });
}
