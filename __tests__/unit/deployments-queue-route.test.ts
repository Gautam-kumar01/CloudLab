import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { addJob } from '@/lib/queue';
import { getWorkspaceProject } from '@/lib/workspace-auth';
import { readCloudLabConfigFile } from '@/lib/runtime-config';
import { POST } from '@/app/api/deployments/route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db', () => ({
  db: {
    project: { findUnique: vi.fn() },
    deployment: { create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  },
}));
vi.mock('@/lib/queue', () => ({ addJob: vi.fn() }));
vi.mock('@/lib/workspace-auth', () => ({ getWorkspaceProject: vi.fn() }));
vi.mock('@/lib/workspace-paths', () => ({ workspacePath: vi.fn(() => '/work/canonical-project') }));
vi.mock('@/lib/runtime-config', () => ({ readCloudLabConfigFile: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAuditEvent: vi.fn() }));

const project = { id: 'canonical-project', ownerId: 'owner-1' };
const deployment = { id: 'deployment-1', projectId: project.id, status: 'QUEUED' };

describe('POST /api/deployments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: 'owner-1' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue(project as any);
    vi.mocked(db.project.findUnique).mockResolvedValue(project as any);
    vi.mocked(db.deployment.create).mockResolvedValue(deployment as any);
    vi.mocked(db.deployment.update).mockResolvedValue({} as any);
    vi.mocked(readCloudLabConfigFile).mockResolvedValue({
      version: 1,
      runtime: 'node20',
      install: 'npm-ci',
      start: 'next-dev',
      port: 3000,
      env: ['DATABASE_URL'],
    } as any);
  });

  it('authorizes owner, validates the manifest and queues only canonical identifiers', async () => {
    const request = new Request('http://localhost/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'workspace-alias' }),
    });
    const response = await POST(request as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.deployment.id).toBe('deployment-1');
    expect(db.project.findUnique).toHaveBeenCalledWith({ where: { id: 'canonical-project' } });
    expect(addJob).toHaveBeenCalledWith('deployment', {
      deploymentId: 'deployment-1',
      projectId: 'canonical-project',
      userId: 'owner-1',
    }, { singletonKey: 'deployment-1' });
    expect(JSON.stringify(vi.mocked(addJob).mock.calls)).not.toContain('secret-value');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('does not queue an invalid manifest', async () => {
    vi.mocked(readCloudLabConfigFile).mockRejectedValue(new Error('Unsupported manifest key.'));
    const request = new Request('http://localhost/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    });
    const response = await POST(request as any);
    expect(response.status).toBe(400);
    expect(addJob).not.toHaveBeenCalled();
    expect(db.deployment.create).not.toHaveBeenCalled();
  });

  it('rejects non-owner callers before creating jobs', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'editor-1' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue({ ...project, ownerId: 'owner-1' } as any);
    const request = new Request('http://localhost/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    });
    const response = await POST(request as any);
    expect(response.status).toBe(403);
    expect(addJob).not.toHaveBeenCalled();
  });

  it('marks a deployment failed if the queue is unavailable', async () => {
    vi.mocked(addJob).mockRejectedValue(new Error('queue offline'));
    const request = new Request('http://localhost/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    });
    const response = await POST(request as any);
    expect(response.status).toBe(503);
    expect(db.deployment.update).toHaveBeenCalledWith({
      where: { id: deployment.id },
      data: { status: 'FAILED' },
    });
  });
});
