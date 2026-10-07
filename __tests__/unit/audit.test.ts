import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAuditEvent } from '@/lib/audit';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe('logAuditEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ignores calls with empty userId or action', async () => {
    await logAuditEvent('', 'ACTION');
    await logAuditEvent('user-1', '');
    expect(db.auditLog.create).not.toHaveBeenCalled();
  });

  it('records an audit event and redacts sensitive credentials', async () => {
    vi.mocked(db.auditLog.create).mockResolvedValue({ id: '1' } as any);

    await logAuditEvent('user-123', 'GITHUB_PUBLISH', {
      repo: 'my-repo',
      token: 'ghp_secretToken12345',
      nested: {
        password: 'superSecretPassword',
        validKey: 'allowed',
      },
    });

    expect(db.auditLog.create).toHaveBeenCalledTimes(1);
    const callArg = vi.mocked(db.auditLog.create).mock.calls[0][0];
    expect(callArg.data.userId).toBe('user-123');
    expect(callArg.data.action).toBe('GITHUB_PUBLISH');

    const parsedDetails = JSON.parse(callArg.data.details!);
    expect(parsedDetails.token).toBe('[REDACTED]');
    expect(parsedDetails.nested.password).toBe('[REDACTED]');
    expect(parsedDetails.nested.validKey).toBe('allowed');
  });

  it('catches database insertion errors without throwing to caller', async () => {
    vi.mocked(db.auditLog.create).mockRejectedValue(new Error('Foreign key violation'));

    await expect(
      logAuditEvent('nonexistent-user', 'DEPLOYMENT_START', { container: 'c1' })
    ).resolves.not.toThrow();
  });
});
