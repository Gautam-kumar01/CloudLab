import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE as deleteMember } from '@/app/api/workspace/members/route';
import { GET as getAccess } from '@/app/api/workspace/access/route';
import { GET as getFiles } from '@/app/api/workspace/files/route';
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
      findMany: vi.fn(),
    },
    workspaceMember: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    container: {
      findFirst: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe('Phase B: Credential & Authorization Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DELETE /api/workspace/members (Scoped Member Deletion)', () => {
    it('blocks deleting a member that belongs to another workspace (cross-tenant deletion attack)', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'owner-user', name: 'Owner' },
      } as any);

      // Caller owns workspace A
      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'workspace-a',
        ownerId: 'owner-user',
        members: [],
      } as any);

      // Member belongs to workspace B, not workspace A!
      vi.mocked(db.workspaceMember.findFirst).mockResolvedValue(null);

      const req = new Request('http://localhost/api/workspace/members?workspaceId=workspace-a&memberId=victim-member-in-workspace-b');
      const res = await deleteMember(req as any);

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/Member not found in the specified workspace/i);
      expect(db.workspaceMember.delete).not.toHaveBeenCalled();
    });

    it('allows deleting a member when member strictly belongs to authorized workspace', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'owner-user', name: 'Owner' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'workspace-a',
        ownerId: 'owner-user',
        members: [],
      } as any);

      vi.mocked(db.workspaceMember.findFirst).mockResolvedValue({
        id: 'valid-member-1',
        projectId: 'workspace-a',
        userId: 'some-user',
      } as any);
      vi.mocked(db.workspaceMember.delete).mockResolvedValue({} as any);

      const req = new Request('http://localhost/api/workspace/members?workspaceId=workspace-a&memberId=valid-member-1');
      const res = await deleteMember(req as any);

      expect(res.status).toBe(200);
      expect(db.workspaceMember.delete).toHaveBeenCalledWith({
        where: { id: 'valid-member-1' },
      });
    });
  });

  describe('GET /api/workspace/access (DISABLED Workspace Status)', () => {
    it('rejects access to DISABLED workspaces even if user is owner', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'owner-user', name: 'Owner' },
      } as any);

      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'disabled-ws',
        name: 'disabled-project',
        ownerId: 'owner-user',
        status: 'DISABLED',
        members: [],
      } as any);

      const req = new Request('http://localhost/api/workspace/access?workspaceId=disabled-ws');
      const res = await getAccess(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error?.message || json.error).toMatch(/Workspace is disabled by administrator/i);
    });
  });

  describe('GET /api/workspace/files (Viewer File Tree Access)', () => {
    it('allows read-only VIEWER with canAccessWorkspace to list workspace files', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'viewer-user', name: 'Viewer' },
      } as any);

      // User is a member with VIEWER role
      vi.mocked(db.project.findFirst).mockResolvedValue({
        id: 'ws-collab',
        name: 'collab-project',
        ownerId: 'owner-user',
        status: 'ACTIVE',
        members: [{ userId: 'viewer-user', role: 'VIEWER' }],
      } as any);

      const req = new Request('http://localhost/api/workspace/files?id=ws-collab');
      const res = await getFiles(req);

      // Viewer should NOT get 403 Forbidden!
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data || json).toBeDefined();
    });
  });
});
