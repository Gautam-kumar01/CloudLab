import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getWorkspaceProject } from '@/lib/workspace-auth';
import { encryptEnvironmentValue } from '@/lib/environment-secrets';
import { logAuditEvent } from '@/lib/audit';
import { GET, PUT, DELETE } from '@/app/api/workspace/environment/route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db', () => ({
  db: {
    environmentVariable: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));
vi.mock('@/lib/workspace-auth', () => ({ getWorkspaceProject: vi.fn() }));
vi.mock('@/lib/environment-secrets', () => ({ encryptEnvironmentValue: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAuditEvent: vi.fn() }));

const ownerProject = { id: 'canonical-project', ownerId: 'owner-1' };
const makeRequest = (method: string, body?: unknown) => new Request('http://localhost/api/workspace/environment', {
  method,
  headers: { 'Content-Type': 'application/json' },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

describe('/api/workspace/environment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: 'owner-1' } } as any);
    vi.mocked(getWorkspaceProject).mockResolvedValue(ownerProject as any);
    vi.mocked(encryptEnvironmentValue).mockReturnValue('cloudlab-encrypted:v1:test-ciphertext');
    vi.mocked(db.environmentVariable.findMany).mockResolvedValue([{ key: 'DATABASE_URL' }] as any);
    vi.mocked(db.environmentVariable.upsert).mockResolvedValue({ key: 'DATABASE_URL' } as any);
    vi.mocked(db.environmentVariable.deleteMany).mockResolvedValue({ count: 1 } as any);
  });

  it('lists names only to the owner and never returns stored values', async () => {
    const response = await GET(new Request('http://localhost/api/workspace/environment?id=alias') as any);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(body.variables).toEqual([{ key: 'DATABASE_URL' }]);
    expect(db.environmentVariable.findMany).toHaveBeenCalledWith(expect.objectContaining({
      select: { key: true },
      where: { projectId: 'canonical-project' },
    }));
    expect(JSON.stringify(body)).not.toContain('secret-value');
  });

  it('encrypts values before persistence and returns only the key', async () => {
    const value = 'postgres://sensitive-password@example.test/app';
    const response = await PUT(makeRequest('PUT', { workspaceId: 'alias', key: 'DATABASE_URL', value }) as any);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(encryptEnvironmentValue).toHaveBeenCalledWith(value);
    expect(db.environmentVariable.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { projectId_key: { projectId: 'canonical-project', key: 'DATABASE_URL' } },
      update: { value: 'cloudlab-encrypted:v1:test-ciphertext' },
    }));
    expect(JSON.stringify(body)).not.toContain(value);
    expect(logAuditEvent).toHaveBeenCalledWith('owner-1', 'WORKSPACE_ENV_SET', {
      workspaceId: 'canonical-project', key: 'DATABASE_URL',
    });
  });

  it('does not allow collaborators to list or modify secret values', async () => {
    vi.mocked(getWorkspaceProject).mockResolvedValue({ ...ownerProject, ownerId: 'someone-else' } as any);
    const getResponse = await GET(new Request('http://localhost/api/workspace/environment?id=alias') as any);
    const putResponse = await PUT(makeRequest('PUT', { workspaceId: 'alias', key: 'TOKEN', value: 'secret' }) as any);
    expect(getResponse.status).toBe(404);
    expect(putResponse.status).toBe(404);
    expect(db.environmentVariable.upsert).not.toHaveBeenCalled();
  });

  it('deletes by key without reading or returning the value', async () => {
    const response = await DELETE(new Request('http://localhost/api/workspace/environment?id=alias&key=DATABASE_URL', { method: 'DELETE' }) as any);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, key: 'DATABASE_URL', deleted: true });
    expect(db.environmentVariable.deleteMany).toHaveBeenCalledWith({
      where: { projectId: 'canonical-project', key: 'DATABASE_URL' },
    });
  });
});
