import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getPreview } from '@/app/api/preview/[workspaceId]/route';
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

    it('rejects arbitrary internal port scanning attempts (e.g. Postgres 5432) with 403 Forbidden', async () => {
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

      // Attempt to probe PostgreSQL internal port 5432
      const req = new Request('http://localhost/api/preview/ws-test?_port=5432');
      const res = await getPreview(req as any, {
        params: Promise.resolve({ workspaceId: 'ws-test' }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/not an authorized web preview port/i);
    });

    it('rejects Docker daemon port probe (2375) with 403 Forbidden', async () => {
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

      const req = new Request('http://localhost/api/preview/ws-test?_port=2375');
      const res = await getPreview(req as any, {
        params: Promise.resolve({ workspaceId: 'ws-test' }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/not an authorized web preview port/i);
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
