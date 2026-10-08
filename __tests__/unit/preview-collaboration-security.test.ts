import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getPreview, isLoopbackTarget, resolveWorkspaceInternalPort, MAX_REQUEST_BODY_BYTES, MAX_RESPONSE_BODY_BYTES } from '@/app/api/preview/[workspaceId]/route';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { workspaceFilePath } from '@/lib/workspace-paths';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    project: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    container: {
      findFirst: vi.fn(),
    },
  },
}));

describe('Preview and Collaboration Ingress Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/preview/[workspaceId]', () => {
    it('rejects unauthenticated preview requests with 401 Unauthorized', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      const req = new Request('http://localhost/api/preview/ws-test-1');
      const res = await getPreview(req as any, {
        params: Promise.resolve({ workspaceId: 'ws-test-1' }),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/Unauthorized/i);
    });

    it('rejects cross-tenant preview requests with 403 Forbidden', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'attacker-1', name: 'Attacker' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-victim',
        name: 'victim-project',
        ownerId: 'victim-user',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/preview/ws-victim');
      const res = await getPreview(req as any, {
        params: Promise.resolve({ workspaceId: 'ws-victim' }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/Forbidden/i);
    });

    it('blocks host loopback targets in production mode', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'legit-user', name: 'Legit' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-test',
        name: 'my-project',
        ownerId: 'legit-user',
        members: [],
        status: 'ACTIVE',
      } as any);

      const oldEnv = process.env.NODE_ENV;
      const oldHost = process.env.CONTAINER_HOST;
      const oldAllow = process.env.ALLOW_LOOPBACK_PREVIEW;

      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
        process.env.CONTAINER_HOST = '127.0.0.1';
        delete process.env.ALLOW_LOOPBACK_PREVIEW;

        const req = new Request('http://localhost/api/preview/ws-test');
        const res = await getPreview(req as any, {
          params: Promise.resolve({ workspaceId: 'ws-test' }),
        });

        expect(res.status).toBe(403);
        const json = await res.json();
        expect(json.error?.message || json.error).toMatch(/Direct host loopback preview routing is blocked/i);
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = oldEnv;
        process.env.CONTAINER_HOST = oldHost;
        process.env.ALLOW_LOOPBACK_PREVIEW = oldAllow;
      }
    });

    it('isLoopbackTarget accurately detects loopback variations', () => {
      expect(isLoopbackTarget('127.0.0.1')).toBe(true);
      expect(isLoopbackTarget('localhost')).toBe(true);
      expect(isLoopbackTarget('0.0.0.0')).toBe(true);
      expect(isLoopbackTarget('::1')).toBe(true);
      expect(isLoopbackTarget('127.0.1.1')).toBe(true);
      expect(isLoopbackTarget('my-app.localhost')).toBe(true);
      expect(isLoopbackTarget('cloudlab-workspace-container')).toBe(false);
      expect(isLoopbackTarget('172.18.0.2')).toBe(false);
    });

    it('rejects oversized request bodies with 413 Payload Too Large', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'legit-user', name: 'Legit' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-test',
        name: 'my-project',
        ownerId: 'legit-user',
        members: [],
        status: 'ACTIVE',
      } as any);

      const req = new Request('http://localhost/api/preview/ws-test', {
        headers: {
          'content-length': String(MAX_REQUEST_BODY_BYTES + 1024),
        },
      });

      const res = await getPreview(req as any, {
        params: Promise.resolve({ workspaceId: 'ws-test' }),
      });

      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/Payload Too Large/i);
    });
  });

  describe('Yjs Collaboration Filesystem Security', () => {
    it('blocks directory traversal in collaboration file paths', () => {
      expect(() => {
        workspaceFilePath('ws-1', '../../etc/passwd');
      }).toThrow(/Invalid workspace file path/i);
    });

    it('blocks null byte injection in collaboration file paths', () => {
      expect(() => {
        workspaceFilePath('ws-1', 'src/\0hack.js');
      }).toThrow(/null byte detected/i);
    });

    it('blocks reading or modifying .git/config in collaboration paths', () => {
      expect(() => {
        workspaceFilePath('ws-1', '.git/config');
      }).toThrow(/Access to \.git directory or files is restricted/i);
    });

    it('blocks nested .git path access in collaboration paths', () => {
      expect(() => {
        workspaceFilePath('ws-1', 'submodule/.git/config');
      }).toThrow(/Access to \.git directory or files is restricted/i);
    });

    it('allows valid application source files', () => {
      const resolved = workspaceFilePath('ws-1', 'src/App.tsx');
      expect(resolved).toContain('ws-1');
      expect(resolved).toContain('src');
      expect(resolved).toContain('App.tsx');
    });
  });
});
