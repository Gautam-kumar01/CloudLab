import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@/auth';
import { canEditWorkspace, getWorkspaceProject } from '@/lib/workspace-auth';
import { readCloudLabConfigFile } from '@/lib/runtime-config';
import { GET } from '@/app/api/workspace/runtime-config/route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/workspace-auth', () => ({
  canEditWorkspace: vi.fn(),
  getWorkspaceProject: vi.fn(),
}));
vi.mock('@/lib/runtime-config', () => ({
  readCloudLabConfigFile: vi.fn(),
}));

describe('GET /api/workspace/runtime-config', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects anonymous callers before workspace lookup', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const response = await GET(new Request('http://localhost/api/workspace/runtime-config?id=project-a'));
    expect(response.status).toBe(401);
    expect(getWorkspaceProject).not.toHaveBeenCalled();
    expect(readCloudLabConfigFile).not.toHaveBeenCalled();
  });

  it('does not reveal manifest data to non-members', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'outsider' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue(null as any);
    const response = await GET(new Request('http://localhost/api/workspace/runtime-config?id=private-project'));
    expect(response.status).toBe(404);
    expect(readCloudLabConfigFile).not.toHaveBeenCalled();
  });

  it('returns validated configuration without secret values and disables caching', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'owner' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue({ id: 'canonical-project', ownerId: 'owner' } as any);
    vi.mocked(canEditWorkspace).mockResolvedValue(true);
    vi.mocked(readCloudLabConfigFile).mockResolvedValue({
      version: 1,
      runtime: 'node20',
      install: 'npm-ci',
      start: 'next-dev',
      port: 3000,
      env: ['DATABASE_URL'],
    } as any);

    const response = await GET(new Request('http://localhost/api/workspace/runtime-config?id=project-alias'));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(readCloudLabConfigFile).toHaveBeenCalledWith(expect.stringContaining('canonical-project'));
    expect(body.config.env).toEqual(['DATABASE_URL']);
    expect(JSON.stringify(body)).not.toContain('secret-value');
    expect(body.canDeploy).toBe(true);
  });

  it('surfaces a validation message without exposing parser internals', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'owner' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue({ id: 'project-a', ownerId: 'owner' } as any);
    vi.mocked(canEditWorkspace).mockResolvedValue(true);
    vi.mocked(readCloudLabConfigFile).mockRejectedValue(new Error('port must be one of CloudLab approved preview ports.'));

    const response = await GET(new Request('http://localhost/api/workspace/runtime-config?id=project-a'));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.valid).toBe(false);
    expect(body.error).toMatch(/approved preview ports/);
  });
});
