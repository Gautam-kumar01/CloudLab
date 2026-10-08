import { describe, it, expect } from 'vitest';
import {
  getPreviewRouting,
  generateCaddyConfig,
  generateTraefikConfig,
} from '@/lib/proxy-manager';

describe('proxy-manager', () => {
  it('generates proper routing URLs for workspaces', () => {
    const routing = getPreviewRouting('workspace-abc123', 3000);
    expect(routing.workspaceId).toBe('workspace-abc123');
    expect(routing.targetPort).toBe(3000);
    expect(routing.containerName).toBe('cloudlab-workspace-abc123-container');
    expect(routing.pathUrl).toBe('/api/preview/workspace-abc123/');
    expect(routing.subdomainUrl).toMatch(/^http:\/\/workspace-abc123\./);
  });

  it('generates valid Caddy dynamic reverse proxy configurations', () => {
    const routes = [
      { workspaceId: 'ws-1', targetPort: 3000, containerName: 'cloudlab-workspace-ws-1' },
      { workspaceId: 'ws-2', targetPort: 5173, containerName: 'cloudlab-workspace-ws-2' },
    ];
    const caddyfile = generateCaddyConfig(routes);
    expect(caddyfile).toContain('ws-1.');
    expect(caddyfile).toContain('reverse_proxy cloudlab-workspace-ws-1:3000');
    expect(caddyfile).toContain('ws-2.');
    expect(caddyfile).toContain('reverse_proxy cloudlab-workspace-ws-2:5173');
  });

  it('generates valid Traefik router and service configurations', () => {
    const routes = [
      { workspaceId: 'ws-1', targetPort: 3000, containerName: 'cloudlab-workspace-ws-1' },
    ];
    const traefik = generateTraefikConfig(routes);
    expect(traefik.http.routers['cloudlab-ws-1']).toBeDefined();
    expect(traefik.http.routers['cloudlab-ws-1'].rule).toContain('ws-1');
    expect(traefik.http.services['cloudlab-ws-1'].loadBalancer.servers[0].url).toBe(
      'http://cloudlab-workspace-ws-1:3000'
    );
  });
});
