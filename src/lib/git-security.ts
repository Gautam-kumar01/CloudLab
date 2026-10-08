import { runCommand } from './process';

/**
 * Strips embedded user tokens from git remote configuration on disk.
 * e.g., converts 'https://ghp_12345@github.com/user/repo' to 'https://github.com/user/repo'
 */
export async function scrubGitRemoteCredentials(cwd: string): Promise<void> {
  try {
    const { stdout } = await runCommand('git', ['remote', 'get-url', 'origin'], { cwd });
    const rawUrl = stdout.trim();
    if (!rawUrl) return;

    if (rawUrl.startsWith('https://') && rawUrl.includes('@')) {
      const sanitizedUrl = rawUrl.replace(/^https:\/\/[^@]+@/, 'https://');
      await runCommand('git', ['remote', 'set-url', 'origin', sanitizedUrl], { cwd });
      console.log(`[Git Security] Scrubbed credentials from origin remote URL in ${cwd}`);
    }
  } catch {
    // If origin remote doesn't exist or git fails, ignore safely
  }
}

/**
 * Returns ephemeral git CLI authorization flags that inject the token per-command
 * without writing it to .git/config on disk.
 */
export function getGitAuthArgs(token: string): string[] {
  if (!token) return [];
  const basicAuth = Buffer.from(`x-access-token:${token}`).toString('base64');
  return ['-c', `http.extraHeader=AUTHORIZATION: basic ${basicAuth}`];
}

/**
 * Returns ephemeral environment variables for git authentication.
 * Uses GIT_CONFIG_COUNT / GIT_CONFIG_KEY_* / GIT_CONFIG_VALUE_* so credentials
 * are never exposed in process argument lists (ps, /proc/cmdline).
 */
export function getGitAuthEnv(token: string): Record<string, string> {
  if (!token) return {};
  const basicAuth = Buffer.from(`x-access-token:${token}`).toString('base64');
  return {
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.extraHeader',
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${basicAuth}`,
  };
}

/**
 * Checks if a relative path attempts to read internal git credentials or configuration.
 */
export function isGitInternalPath(relativePath: string): boolean {
  if (!relativePath) return false;
  const normalized = relativePath.replace(/\\/g, '/').toLowerCase();
  return (
    normalized === '.git' ||
    normalized.startsWith('.git/') ||
    normalized.includes('/.git/') ||
    normalized.endsWith('/.git')
  );
}
