/**
 * API Key Encryption Utilities
 * Encrypts sensitive data using Web Crypto API
 */

/**
 * Generate a key from password/passphrase
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create encryption key
 * Uses a device-specific identifier as the passphrase
 */
async function getEncryptionKey(): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  // Try to get stored salt
  const stored = await chrome.storage.local.get(['encryption_salt']);
  let salt: Uint8Array;

  if (stored.encryption_salt) {
    salt = new Uint8Array(stored.encryption_salt);
  } else {
    // Generate new salt
    salt = crypto.getRandomValues(new Uint8Array(16));
    await chrome.storage.local.set({ encryption_salt: Array.from(salt) });
  }

  // Use a combination of extension ID and user agent as passphrase
  // This is device-specific but consistent
  const passphrase = `${chrome.runtime.id}-${navigator.userAgent}`;
  const key = await deriveKey(passphrase, salt);

  return { key, salt };
}

/**
 * Encrypt a string
 */
export async function encryptString(plaintext: string): Promise<string> {
  if (!plaintext) return '';

  try {
    const encoder = new TextEncoder();
    const { key } = await getEncryptionKey();

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string
 */
export async function decryptString(encrypted: string): Promise<string> {
  if (!encrypted) return '';

  try {
    const { key } = await getEncryptionKey();

    // Decode from base64
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt API key for storage
 */
export async function encryptAPIKey(apiKey: string): Promise<string> {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key cannot be empty');
  }

  return encryptString(apiKey.trim());
}

/**
 * Decrypt API key from storage
 */
export async function decryptAPIKey(encryptedKey: string): Promise<string> {
  if (!encryptedKey || encryptedKey.trim().length === 0) {
    return '';
  }

  return decryptString(encryptedKey);
}

/**
 * Securely store API key
 */
export async function storeAPIKey(
  provider: string,
  apiKey: string
): Promise<void> {
  const encrypted = await encryptAPIKey(apiKey);
  const key = `encrypted_${provider}_api_key`;
  await chrome.storage.local.set({ [key]: encrypted });
}

/**
 * Securely retrieve API key
 */
export async function retrieveAPIKey(provider: string): Promise<string | null> {
  const key = `encrypted_${provider}_api_key`;
  const stored = await chrome.storage.local.get([key]);

  if (!stored[key]) {
    return null;
  }

  try {
    return await decryptAPIKey(stored[key]);
  } catch (error) {
    console.error(`Failed to decrypt ${provider} API key:`, error);
    return null;
  }
}

/**
 * Remove stored API key
 */
export async function removeAPIKey(provider: string): Promise<void> {
  const key = `encrypted_${provider}_api_key`;
  await chrome.storage.local.remove([key]);
}

/**
 * Check if API key exists for provider
 */
export async function hasAPIKey(provider: string): Promise<boolean> {
  const key = `encrypted_${provider}_api_key`;
  const stored = await chrome.storage.local.get([key]);
  return !!stored[key];
}

/**
 * Migrate existing unencrypted keys to encrypted storage
 */
export async function migrateToEncrypted(): Promise<void> {
  const providers = ['openai', 'anthropic', 'google', 'azure'];
  const oldKeys = await chrome.storage.local.get(
    providers.map((p) => `${p}_api_key`)
  );

  for (const provider of providers) {
    const oldKey = `${provider}_api_key`;
    const apiKey = oldKeys[oldKey];

    if (apiKey && typeof apiKey === 'string' && apiKey.length > 0) {
      // Encrypt and store
      await storeAPIKey(provider, apiKey);

      // Remove old unencrypted key
      await chrome.storage.local.remove([oldKey]);

      console.log(`✓ Migrated ${provider} API key to encrypted storage`);
    }
  }
}
