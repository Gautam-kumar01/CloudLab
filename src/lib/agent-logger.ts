import fs from 'fs';
import path from 'path';

export function logAgentAction(action: string, details: any) {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'agent.log');
  const timestamp = new Date().toISOString();
  
  // Sanitize potential secrets
  const sanitizedDetails = JSON.stringify(details, (key, value) => {
    if (typeof key === 'string' && (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('password'))) {
      return '[REDACTED]';
    }
    return value;
  }, 2);

  const logEntry = `[${timestamp}] ACTION: ${action}\nDETAILS: ${sanitizedDetails}\n\n`;

  try {
    fs.appendFileSync(logFile, logEntry, 'utf8');
    // In the future (Production), we will save this to Prisma AuditLog
    // await prisma.auditLog.create({ ... })
  } catch (error) {
    console.error('[Agent Logger] Failed to write log:', error);
  }
}
