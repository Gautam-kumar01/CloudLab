import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getDownload } from '@/app/api/workspace/download/route';
import { GET as getExport } from '@/app/api/workspace/export/route';
import { POST as postDeployment } from '@/app/api/deployments/route';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import * as queueModule from '@/lib/queue';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    project: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    deployment: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    environmentVariable: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    auditLog: {
      create: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

vi.mock('@/lib/queue', () => ({
  addJob: vi.fn().mockResolvedValue({ id: 'job_123' }),
  getQueue: vi.fn(),
}));

describe('Phase 2 Hardening & Worker Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/workspace/download', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      const req = new Request('http://localhost/api/workspace/download?id=ws-1&filename=index.js');
      const res = await getDownload(req);
      expect(res.status).toBe(401);
    });

    it('returns 403 on cross-tenant access attempt', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'attacker', name: 'Attacker' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue(null);

      const req = new Request('http://localhost/api/workspace/download?id=ws-secret&filename=index.js');
      const res = await getDownload(req);
      expect(res.status).toBe(403);
    });

    it('returns 400 when missing parameters', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'legit-user' },
      } as any);

      const req = new Request('http://localhost/api/workspace/download?id=ws-1');
      const res = await getDownload(req);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/workspace/export', () => {
    it('returns 400 on invalid or malformed workspace identifier', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'legit-user' },
      } as any);

      const req = new Request('http://localhost/api/workspace/export?workspaceId=../escape');
      const res = await getExport(req as any);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/valid workspace id/i);
    });

    it('returns 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      const req = new Request('http://localhost/api/workspace/export?workspaceId=ws-valid');
      const res = await getExport(req as any);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/deployments', () => {
    it('attaches userId and enqueues deployment job with audit logging', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'owner-user', name: 'Owner' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-deploy',
        name: 'Deploy Project',
        ownerId: 'owner-user',
        status: 'ACTIVE',
        members: [],
      } as any);

      vi.mocked(db.project.findUnique).mockResolvedValue({
        id: 'ws-deploy',
        name: 'Deploy Project',
        ownerId: 'owner-user',
      } as any);

      vi.mocked(db.deployment.create).mockResolvedValue({
        id: 'dep-999',
        projectId: 'ws-deploy',
        status: 'QUEUED',
        createdAt: new Date(),
      } as any);

      const req = new Request('http://localhost/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: 'ws-deploy' }),
      });

      const res = await postDeployment(req as any);
      expect(res.status).toBe(200);

      expect(queueModule.addJob).toHaveBeenCalledWith(
        'deployment',
        expect.objectContaining({
          deploymentId: 'dep-999',
          projectId: 'ws-deploy',
          userId: 'owner-user',
        }),
        expect.any(Object)
      );

      expect(db.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'owner-user',
            action: 'DEPLOYMENT_START',
          }),
        })
      );
    });
  });
});
