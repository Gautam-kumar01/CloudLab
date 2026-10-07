import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccessWorkspace, getWorkspaceProject, canEditWorkspace, getWorkspaceRole } from '@/lib/workspace-auth';
import { db } from '@/lib/db';

// Mock the database client
vi.mock('@/lib/db', () => ({
  db: {
    project: {
      findFirst: vi.fn(),
    },
  },
}));

describe('workspace-auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getWorkspaceProject', () => {
    it('returns null if userId or workspaceId is missing', async () => {
      expect(await getWorkspaceProject('', 'workspace1')).toBeNull();
      expect(await getWorkspaceProject('user1', '')).toBeNull();
    });

    it('returns project if user is the owner', async () => {
      const mockProject = {
        id: 'proj1',
        name: 'workspace1',
        ownerId: 'user1',
        members: [],
      };
      
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);

      const result = await getWorkspaceProject('user1', 'workspace1');
      expect(result).toEqual(mockProject);
    });

    it('returns project if user is a member', async () => {
      const mockProject = {
        id: 'proj1',
        name: 'workspace1',
        ownerId: 'user1', // Not the requesting user
        members: [{ userId: 'user2' }],
      };
      
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);

      const result = await getWorkspaceProject('user2', 'workspace1');
      expect(result).toEqual(mockProject);
    });

    it('returns null if user is neither owner nor member', async () => {
      const mockProject = {
        id: 'proj1',
        name: 'workspace1',
        ownerId: 'user1',
        members: [{ userId: 'user2' }],
      };
      
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);

      const result = await getWorkspaceProject('user3', 'workspace1');
      expect(result).toBeNull();
    });

    it('returns null if database query throws an error', async () => {
      vi.mocked(db.project.findFirst).mockRejectedValue(new Error('DB Error'));

      const result = await getWorkspaceProject('user1', 'workspace1');
      expect(result).toBeNull();
    });
  });

  describe('canAccessWorkspace', () => {
    it('returns true when user has access', async () => {
      const mockProject = {
        id: 'proj1',
        ownerId: 'user1',
        members: [],
      };
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);
      
      expect(await canAccessWorkspace('user1', 'proj1')).toBe(true);
    });

    it('returns false when user does not have access', async () => {
      vi.mocked(db.project.findFirst).mockResolvedValue(null);
      
      expect(await canAccessWorkspace('user1', 'proj1')).toBe(false);
    });
  });

  describe('canEditWorkspace and role authorization', () => {
    it('grants edit permissions to OWNER', async () => {
      const mockProject = {
        id: 'proj1',
        ownerId: 'ownerUser',
        members: [],
      };
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);

      expect(await getWorkspaceRole('ownerUser', 'proj1')).toBe('OWNER');
      expect(await canEditWorkspace('ownerUser', 'proj1')).toBe(true);
    });

    it('grants edit permissions to EDITOR member', async () => {
      const mockProject = {
        id: 'proj1',
        ownerId: 'ownerUser',
        members: [{ userId: 'editorUser', role: 'EDITOR' }],
      };
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);

      expect(await getWorkspaceRole('editorUser', 'proj1')).toBe('EDITOR');
      expect(await canEditWorkspace('editorUser', 'proj1')).toBe(true);
    });

    it('blocks VIEWER member from editing or mutating workspace', async () => {
      const mockProject = {
        id: 'proj1',
        ownerId: 'ownerUser',
        members: [{ userId: 'viewerUser', role: 'VIEWER' }],
      };
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);

      expect(await getWorkspaceRole('viewerUser', 'proj1')).toBe('VIEWER');
      expect(await canEditWorkspace('viewerUser', 'proj1')).toBe(false);
    });

    it('blocks anonymous or non-member users who guess workspace ID', async () => {
      const mockProject = {
        id: 'proj1',
        ownerId: 'ownerUser',
        members: [{ userId: 'otherUser', role: 'EDITOR' }],
      };
      vi.mocked(db.project.findFirst).mockResolvedValue(mockProject as any);

      expect(await getWorkspaceRole('attackerUser', 'proj1')).toBeNull();
      expect(await canEditWorkspace('attackerUser', 'proj1')).toBe(false);
    });
  });
});

