import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getWorkspaceHealth } from '@/app/api/workspace/health/route';
import { auth } from '@/auth';
import { DockerManager } from '@/lib/docker-manager';
import { getWorkspaceProject } from '@/lib/workspace-auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/workspace-auth', () => ({ getWorkspaceProject: vi.fn() }));
vi.mock('@/lib/docker-manager', () => ({
  DockerManager: { getWorkspaceHealth: vi.fn() },
}));

describe('GET /api/workspace/health', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unauthenticated callers before looking up workspace access', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const response = await getWorkspaceHealth(new Request('http://localhost/api/workspace/health?workspaceId=workspace-a'));

    expect(response.status).toBe(401);
    expect(getWorkspaceProject).not.toHaveBeenCalled();
    expect(DockerManager.getWorkspaceHealth).not.toHaveBeenCalled();
  });

  it('does not inspect Docker for a workspace the caller cannot access', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'other-user' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue(null as any);

    const response = await getWorkspaceHealth(new Request('http://localhost/api/workspace/health?workspaceId=private-workspace'));

    expect(response.status).toBe(404);
    expect(DockerManager.getWorkspaceHealth).not.toHaveBeenCalled();
  });

  it('uses the authorized canonical project ID and disables response caching', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'member-user' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue({ id: 'canonical-project-id' } as any);
    vi.mocked(DockerManager.getWorkspaceHealth).mockResolvedValue({
      status: 'running',
      limits: { cpus: 1, memoryBytes: 1073741824, processLimit: 100 },
      usage: { cpuPercent: '1.25%', memoryUsage: '22MiB / 1GiB', memoryPercent: '2.20%' },
      checkedAt: '2026-10-10T10:00:00.000Z',
    } as any);

    const response = await getWorkspaceHealth(new Request('http://localhost/api/workspace/health?workspaceId=project-alias'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(getWorkspaceProject).toHaveBeenCalledWith('member-user', 'project-alias');
    expect(DockerManager.getWorkspaceHealth).toHaveBeenCalledWith('canonical-project-id');
    expect(body.data.health.status).toBe('running');
    expect(body.data.health.limits.processLimit).toBe(100);
  });
});
