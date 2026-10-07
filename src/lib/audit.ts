import { db } from './db';

export interface AuditEventOptions {
  userId: string;
  action: string;
  details?: Record<string, any> | string;
}

const SENSITIVE_KEY_PATTERNS = [
  'token',
  'password',
  'secret',
  'pat',
  'authorization',
  'apikey',
  'credential',
  'privatekey',
  'cert',
];

/**
 * Recursively sanitizes any sensitive properties from an audit payload.
 */
function sanitizeDetails(details: any): any {
  if (!details || typeof details !== 'object') {
    return details;
  }

  if (Array.isArray(details)) {
    return details.map(sanitizeDetails);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(details)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) =>
      key.toLowerCase().includes(pattern)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (val && typeof val === 'object') {
      sanitized[key] = sanitizeDetails(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Centralized audit logger that securely records administrative and high-impact security actions.
 * Never throws exceptions that could disrupt user operations, but warns on persistence issues.
 */
export async function logAuditEvent(
  userId: string,
  action: string,
  details?: Record<string, any> | string
): Promise<void> {
  if (!userId || !action) {
    return;
  }

  try {
    let sanitizedString: string | undefined;

    if (typeof details === 'object' && details !== null) {
      const cleaned = sanitizeDetails(details);
      sanitizedString = JSON.stringify(cleaned);
    } else if (typeof details === 'string') {
      sanitizedString = details;
    }

    await db.auditLog.create({
      data: {
        userId,
        action,
        details: sanitizedString,
      },
    });
  } catch (error: any) {
    // Audit log should never crash parent request flow (e.g. if foreign key doesn't exist or DB is degraded)
    console.warn(`[AuditLog] Warning: Unable to record event "${action}" for user "${userId}":`, error?.message || error);
  }
}
