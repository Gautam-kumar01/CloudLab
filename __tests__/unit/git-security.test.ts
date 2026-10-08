import { describe, it, expect, vi } from 'vitest';
import { getGitAuthArgs, getGitAuthEnv, isGitInternalPath, scrubGitRemoteCredentials } from '@/lib/git-security';
import * as processModule from '@/lib/process';

describe('git-security', () => {
  it('generates ephemeral basic authorization arguments without writing to disk', () => {
    const args = getGitAuthArgs('ghp_testToken123');
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('-c');
    expect(args[1]).toMatch(/^http\.extraHeader=AUTHORIZATION: basic /);

    const base64Part = args[1].replace('http.extraHeader=AUTHORIZATION: basic ', '');
    const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
    expect(decoded).toBe('x-access-token:ghp_testToken123');
  });

  it('generates ephemeral environment variables for git config without exposing in process args', () => {
    const env = getGitAuthEnv('ghp_testToken123');
    expect(env.GIT_CONFIG_COUNT).toBe('1');
    expect(env.GIT_CONFIG_KEY_0).toBe('http.extraHeader');
    expect(env.GIT_CONFIG_VALUE_0).toMatch(/^AUTHORIZATION: basic /);

    const base64Part = env.GIT_CONFIG_VALUE_0.replace('AUTHORIZATION: basic ', '');
    const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
    expect(decoded).toBe('x-access-token:ghp_testToken123');
  });

  it('returns empty array or object when token is empty', () => {
    expect(getGitAuthArgs('')).toEqual([]);
    expect(getGitAuthEnv('')).toEqual({});
  });

  it('identifies internal .git paths that must be blocked', () => {
    expect(isGitInternalPath('.git')).toBe(true);
    expect(isGitInternalPath('.git/config')).toBe(true);
    expect(isGitInternalPath('.git/credentials')).toBe(true);
    expect(isGitInternalPath('sub/.git/HEAD')).toBe(true);
    expect(isGitInternalPath('.github/workflows/deploy.yml')).toBe(false);
    expect(isGitInternalPath('src/App.tsx')).toBe(false);
  });

  it('scrubs embedded credentials from origin remote URL', async () => {
    const runCommandSpy = vi.spyOn(processModule, 'runCommand');

    // Simulate `git remote get-url origin` returning a URL with embedded credentials
    runCommandSpy.mockResolvedValueOnce({
      stdout: 'https://ghp_secretToken@github.com/user/repo.git\n',
      stderr: '',
    });

    // Simulate `git remote set-url origin`
    runCommandSpy.mockResolvedValueOnce({
      stdout: '',
      stderr: '',
    });

    await scrubGitRemoteCredentials('/fake/workspace');

    expect(runCommandSpy).toHaveBeenCalledWith('git', ['remote', 'get-url', 'origin'], { cwd: '/fake/workspace' });
    expect(runCommandSpy).toHaveBeenCalledWith('git', ['remote', 'set-url', 'origin', 'https://github.com/user/repo.git'], { cwd: '/fake/workspace' });

    runCommandSpy.mockRestore();
  });
});
