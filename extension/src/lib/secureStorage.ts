/**
 * Secure Storage Wrapper
 * Combines encryption and validation for API keys
 */

import { encryptAPIKey, decryptAPIKey, storeAPIKey, retrieveAPIKey, hasAPIKey, removeAPIKey, migrateToEncrypted } from './encryption';
import { validateAPIKeyFormat, maskAPIKey, type APIKeyProvider, type ValidationResult } from './apiKeyValidator';

export interface SecureKeyResult {
  success: boolean;
  error?: string;
  masked?: string;
}

/**
 * Securely save API key with validation
 */
export async function saveSecureAPIKey(
  provider: APIKeyProvider,
  apiKey: string
): Promise<SecureKeyResult> {
  // Validate format first
  const validation = validateAPIKeyFormat(apiKey, provider);

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    // Encrypt and store
    await storeAPIKey(provider, apiKey);

    return {
      success: true,
      masked: maskAPIKey(apiKey),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to save API key',
    };
  }
}

/**
 * Get API key securely
 */
export async function getSecureAPIKey(provider: APIKeyProvider): Promise<string | null> {
  try {
    return await retrieveAPIKey(provider);
  } catch (error) {
    console.error(`Failed to retrieve ${provider} API key:`, error);
    return null;
  }
}

/**
 * Check if provider has valid API key
 */
export async function hasValidAPIKey(provider: APIKeyProvider): Promise<boolean> {
  const key = await getSecureAPIKey(provider);
  if (!key) return false;

  const validation = validateAPIKeyFormat(key, provider);
  return validation.isValid;
}

/**
 * Remove API key
 */
export async function removeSecureAPIKey(provider: APIKeyProvider): Promise<void> {
  await removeAPIKey(provider);
}

/**
 * Get all configured providers
 */
export async function getConfiguredProviders(): Promise<APIKeyProvider[]> {
  const providers: APIKeyProvider[] = ['openai', 'anthropic', 'google', 'azure'];
  const configured: APIKeyProvider[] = [];

  for (const provider of providers) {
    if (await hasAPIKey(provider)) {
      configured.push(provider);
    }
  }

  return configured;
}

/**
 * Initialize secure storage (run on extension install/update)
 */
export async function initializeSecureStorage(): Promise<void> {
  try {
    // Migrate old unencrypted keys
    await migrateToEncrypted();
    console.log('✓ Secure storage initialized');
  } catch (error) {
    console.error('Failed to initialize secure storage:', error);
  }
}

/**
 * Export API keys for backup (encrypted)
 */
export async function exportKeys(): Promise<Record<string, string>> {
  const providers: APIKeyProvider[] = ['openai', 'anthropic', 'google', 'azure'];
  const exported: Record<string, string> = {};

  for (const provider of providers) {
    const key = await getSecureAPIKey(provider);
    if (key) {
      // Re-encrypt with a new key for export
      exported[provider] = await encryptAPIKey(key);
    }
  }

  return exported;
}

/**
 * Import API keys from backup
 */
export async function importKeys(keys: Record<string, string>): Promise<number> {
  let imported = 0;

  for (const [provider, encryptedKey] of Object.entries(keys)) {
    try {
      const decrypted = await decryptAPIKey(encryptedKey);
      const result = await saveSecureAPIKey(provider as APIKeyProvider, decrypted);
      if (result.success) {
        imported++;
      }
    } catch (error) {
      console.error(`Failed to import ${provider} key:`, error);
    }
  }

  return imported;
}
