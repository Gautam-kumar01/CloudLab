import { describe, it, expect, vi } from 'vitest';
import { getGitAuthEnv } from '@/lib/git-security';
import { DockerManager } from '@/lib/docker-manager';

describe('Phase 1 Lifecycle & Persistence Verification', () => {
  describe('Git Security Environment Isolation', () => {
    it('produces GIT_CONFIG_* environment variables instead of exposing tokens in process arguments', () => {
      const token = 'ghp_ephemeral_token_xyz987';
      const env = getGitAuthEnv(token);

      expect(env.GIT_CONFIG_COUNT).toBe('1');
      expect(env.GIT_CONFIG_KEY_0).toBe('http.extraHeader');
      expect(env.GIT_CONFIG_VALUE_0).toContain('AUTHORIZATION: basic ');

      // Verify that the secret token is not exposed as raw text
      expect(env.GIT_CONFIG_VALUE_0).not.toContain(token);

      // Verify valid base64 encoding of basic auth
      const b64 = env.GIT_CONFIG_VALUE_0.replace('AUTHORIZATION: basic ', '');
      const decoded = Buffer.from(b64, 'base64').toString('utf-8');
      expect(decoded).toBe(`x-access-token:${token}`);
    });

    it('returns empty object when no token is provided', () => {
      expect(getGitAuthEnv('')).toEqual({});
    });
  });

  describe('DockerManager Alignment for Deployments & Sandboxes', () => {
    it('accepts valid deployment container names in killContainer', async () => {
      // Valid workspace sandbox name
      expect(async () => {
        // Will throw system/docker error if not installed, but must not throw 'Invalid container identifier'
        try {
          await DockerManager.killContainer('cloudlab-workspace-test1');
        } catch (err: any) {
          expect(err.message).not.toBe('Invalid container identifier');
        }
      }).not.toThrow();

      // Valid deployment container name
      expect(async () => {
        try {
          await DockerManager.killContainer('cloudlab-proj123-container');
        } catch (err: any) {
          expect(err.message).not.toBe('Invalid container identifier');
        }
      }).not.toThrow();

      // Invalid / malicious container identifier
      await expect(DockerManager.killContainer('malicious; rm -rf /')).rejects.toThrow(
        'Invalid container identifier'
      );
      await expect(DockerManager.killContainer('../escape')).rejects.toThrow(
        'Invalid container identifier'
      );
    });

    it('tracks activity correctly for idle reaper', () => {
      DockerManager.touchActivity('ws-alpha');
      const act = DockerManager.getActivity('ws-alpha');
      expect(act).toBeGreaterThan(0);
      expect(act).toBeLessThanOrEqual(Date.now());
    });
  });
});
