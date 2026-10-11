const { createCipheriv, createDecipheriv, createHash, randomBytes } = require('node:crypto');

const PREFIX = 'cloudlab-encrypted:v1:';
const AAD = Buffer.from('cloudlab-environment-variable:v1', 'utf8');

function getEncryptionKey() {
  const material = process.env.CLOUDLAB_ENV_ENCRYPTION_KEY
    || process.env.AUTH_SECRET
    || process.env.NEXTAUTH_SECRET;
  if (!material) {
    throw new Error('Set CLOUDLAB_ENV_ENCRYPTION_KEY or a stable Auth.js secret before saving environment variables.');
  }
  if (Buffer.byteLength(material, 'utf8') < 32) {
    throw new Error('Encryption key material must be at least 32 UTF-8 bytes.');
  }
  return createHash('sha256').update('cloudlab-env-key:v1\0').update(material, 'utf8').digest();
}

function encryptEnvironmentValue(value) {
  if (typeof value !== 'string' || value.includes('\0')) {
    throw new Error('Environment variable value must be valid text.');
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  cipher.setAAD(AAD);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}`;
}

function decryptEnvironmentValue(storedValue) {
  if (typeof storedValue !== 'string') throw new Error('Stored environment value is invalid.');
  // Compatibility for values created before application-level encryption was enabled.
  if (!storedValue.startsWith(PREFIX)) return storedValue;
  const [encodedIv, encodedTag, encodedCiphertext, ...extra] = storedValue.slice(PREFIX.length).split(':');
  if (!encodedIv || !encodedTag || encodedCiphertext === undefined || extra.length) {
    throw new Error('Stored environment value has an invalid encrypted format.');
  }
  const iv = Buffer.from(encodedIv, 'base64url');
  const tag = Buffer.from(encodedTag, 'base64url');
  const ciphertext = Buffer.from(encodedCiphertext, 'base64url');
  if (iv.length !== 12 || tag.length !== 16) throw new Error('Stored environment value has an invalid encrypted format.');
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAAD(AAD);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

module.exports = { encryptEnvironmentValue, decryptEnvironmentValue };
