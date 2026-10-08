import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getFile } from '@/app/api/workspace/file/route';
import { GET as getFiles, POST as postFiles } from '@/app/api/workspace/files/route';
import { POST as postBackup } from '@/app/api/workspace/backup/route';
import { POST as postRestore } from '@/app/api/workspace/restore/route';
import { POST as postRename } from '@/app/api/workspace/rename/route';
import { GET as getHealth } from '@/app/api/health/route';
import { GET as getReady } from '@/app/api/ready/route';
import { auth } from '@/auth';
import { db } from '@/lib/db';

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
    container: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

describe('Route-Level Security and Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/workspace/file', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      const req = new Request('http://localhost/api/workspace/file?id=ws-1&filename=index.js');
      const res = await getFile(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/Unauthorized/i);
    });

    it('returns 403 Forbidden on cross-tenant workspace access attempt', async () => {
      // User is attacker-1, workspace belongs to victim-99
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'attacker-1', name: 'Attacker' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-victim',
        name: 'victim-project',
        ownerId: 'victim-99',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/file?id=ws-victim&filename=index.js');
      const res = await getFile(req);
      expect(res.status).toBe(403);
    });

    it('blocks directory traversal attempts', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-1', name: 'User' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-1',
        name: 'my-project',
        ownerId: 'user-1',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/file?id=ws-1&filename=../../etc/passwd');
      const res = await getFile(req);
      // Path traversal gets caught by workspaceFilePath and returns 500/400 error
      expect(res.status).toBeGreaterThanOrEqual(400);
      const json = await res.json();
      expect(json.error || json.message).toBeDefined();
    });

    it('blocks reading .git configuration or credentials', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-1', name: 'User' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-1',
        name: 'my-project',
        ownerId: 'user-1',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/file?id=ws-1&filename=.git/config');
      const res = await getFile(req);
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/workspace/files', () => {
    it('returns 401 when session is missing', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      const req = new Request('http://localhost/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws-1',
          filename: 'test.js',
          content: 'console.log(1)',
        }),
      });

      const res = await postFiles(req);
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not an editor or owner', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-viewer', name: 'Viewer' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-1',
        name: 'my-project',
        ownerId: 'different-owner',
        members: [{ userId: 'user-viewer', role: 'VIEWER' }],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws-1',
          filename: 'test.js',
          content: 'console.log(1)',
        }),
      });

      const res = await postFiles(req);
      expect(res.status).toBe(403);
    });

    it('rejects path traversal in file write path', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-1', name: 'Owner' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-1',
        name: 'my-project',
        ownerId: 'user-1',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws-1',
          filename: '../escape.js',
          content: 'malicious',
        }),
      });

      const res = await postFiles(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/path traversal/i);
    });
  });

  describe('Backup & Restore Security', () => {
    it('blocks unauthorized users from creating snapshots', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      const req = new Request('http://localhost/api/workspace/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-1' }),
      });

      const res = await postBackup(req as any);
      expect(res.status).toBe(401);
    });

    it('blocks non-owners from restoring snapshots', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'editor-1', name: 'Editor' },
      } as any);

      // User is EDITOR, but only OWNER can restore
      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-1',
        name: 'my-project',
        ownerId: 'owner-99',
        members: [{ userId: 'editor-1', role: 'EDITOR' }],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-1', snapshotId: 'snap_123' }),
      });

      const res = await postRestore(req as any);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/workspace/rename', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      const req = new Request('http://localhost/api/workspace/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-1', oldPath: 'a.js', newPath: 'b.js' }),
      });

      const res = await postRename(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden on cross-tenant rename attempt', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'attacker-1', name: 'Attacker' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-victim',
        name: 'victim-project',
        ownerId: 'victim-99',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-victim', oldPath: 'a.js', newPath: 'b.js' }),
      });

      const res = await postRename(req as any);
      expect(res.status).toBe(403);
    });

    it('returns 403 Forbidden on path traversal in rename', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'owner-1', name: 'Owner' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-1',
        name: 'my-project',
        ownerId: 'owner-1',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/workspace/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-1', oldPath: '../secret.txt', newPath: 'b.js' }),
      });

      const res = await postRename(req as any);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/path traversal detected/i);
    });
  });

  describe('Health and Readiness Probes', () => {
    it('GET /api/health returns 200 with healthy status', async () => {
      const res = await getHealth();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.timestamp).toBeDefined();
    });

    it('GET /api/ready returns 200 with readiness checks without leaking internal paths', async () => {
      const res = await getReady();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ready');
      expect(json.checks.database.status).toBe('healthy');
      expect(json.checks.storage.status).toBe('healthy');
      expect(json.checks.storage.root).toBeUndefined();
    });
  });
});
