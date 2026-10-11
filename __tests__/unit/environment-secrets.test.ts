import { afterEach, describe, expect, it } from 'vitest';

const { decryptEnvironmentValue, encryptEnvironmentValue } = require('../../src/lib/environment-secrets.js');
const originalKey = process.env.CLOUDLAB_ENV_ENCRYPTION_KEY;
const originalAuthSecret = process.env.AUTH_SECRET;
const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;

afterEach(() => {
  if (originalKey === undefined) delete process.env.CLOUDLAB_ENV_ENCRYPTION_KEY;
  else process.env.CLOUDLAB_ENV_ENCRYPTION_KEY = originalKey;
  if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = originalAuthSecret;
  if (originalNextAuthSecret === undefined) delete process.env.NEXTAUTH_SECRET;
  else process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
});

describe('environment secret encryption', () => {
  it('encrypts at rest with randomized authenticated ciphertext and round-trips values', () => {
    process.env.CLOUDLAB_ENV_ENCRYPTION_KEY = 'test-encryption-key-with-adequate-entropy';
    const value = 'postgres://user:secret@example.test/db?ssl=true';
    const first = encryptEnvironmentValue(value);
    const second = encryptEnvironmentValue(value);

    expect(first).toMatch(/^cloudlab-encrypted:v1:/);
    expect(first).not.toBe(value);
    expect(first).not.toBe(second);
    expect(decryptEnvironmentValue(first)).toBe(value);
  });

  it('rejects tampered ciphertext and ciphertext encrypted with a rotated key', () => {
    process.env.CLOUDLAB_ENV_ENCRYPTION_KEY = 'first-stable-encryption-key-material-v1';
    const encrypted = encryptEnvironmentValue('sensitive-value');
    const tampered = `${encrypted.slice(0, -2)}AA`;
    expect(() => decryptEnvironmentValue(tampered)).toThrow();

    process.env.CLOUDLAB_ENV_ENCRYPTION_KEY = 'rotated-encryption-key-material-v2';
    expect(() => decryptEnvironmentValue(encrypted)).toThrow();
  });

  it('reads pre-encryption plaintext values for backward compatibility', () => {
    expect(decryptEnvironmentValue('legacy-value')).toBe('legacy-value');
  });

  it('requires an encryption secret for new writes', () => {
    delete process.env.CLOUDLAB_ENV_ENCRYPTION_KEY;
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    expect(() => encryptEnvironmentValue('secret')).toThrow(/Set CLOUDLAB_ENV_ENCRYPTION_KEY/);
  });

  it('rejects short key material instead of silently deriving a weak key', () => {
    process.env.CLOUDLAB_ENV_ENCRYPTION_KEY = 'too-short';
    expect(() => encryptEnvironmentValue('secret')).toThrow(/at least 32 UTF-8 bytes/);
  });
});
