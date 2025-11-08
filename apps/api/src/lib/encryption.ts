import * as crypto from 'crypto';

/**
 * Encryption utility for API keys
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const SALT_LENGTH = 64; // 64 bytes for key derivation
const TAG_LENGTH = 16; // 16 bytes for GCM authentication tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

/**
 * Get encryption key from environment variable
 * Falls back to a default key in development (NOT for production!)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  // Derive a 32-byte key from the environment key using PBKDF2
  return crypto.pbkdf2Sync(key, 'sales-machine-salt', 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt a string value
 */
export function encrypt(value: string): string {
  if (!value) {
    return value;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Return format: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string value
 */
export function decrypt(encryptedValue: string): string {
  if (!encryptedValue) {
    return encryptedValue;
  }

  // Check if value is already in encrypted format (contains colons)
  if (!encryptedValue.includes(':')) {
    // Legacy: value might not be encrypted yet, return as-is
    return encryptedValue;
  }

  const parts = encryptedValue.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const [ivHex, tagHex, encrypted] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}



