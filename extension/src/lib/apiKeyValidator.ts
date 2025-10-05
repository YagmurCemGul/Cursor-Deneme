/**
 * API Key Validation Utilities
 * Validates API keys for different providers
 */

export type APIKeyProvider = 'openai' | 'anthropic' | 'google' | 'azure';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  provider?: APIKeyProvider;
}

/**
 * API Key format patterns for different providers
 */
const API_KEY_PATTERNS: Record<APIKeyProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{48,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
  google: /^AIza[a-zA-Z0-9_-]{35}$/,
  azure: /^[a-f0-9]{32}$/,
};

/**
 * Validate API key format
 */
export function validateAPIKeyFormat(apiKey: string, provider: APIKeyProvider): ValidationResult {
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      isValid: false,
      error: 'API key cannot be empty',
    };
  }

  const trimmedKey = apiKey.trim();
  const pattern = API_KEY_PATTERNS[provider];

  if (!pattern) {
    return {
      isValid: false,
      error: `Unknown provider: ${provider}`,
    };
  }

  if (!pattern.test(trimmedKey)) {
    return {
      isValid: false,
      error: getFormatErrorMessage(provider),
      provider,
    };
  }

  return {
    isValid: true,
    provider,
  };
}

/**
 * Get user-friendly error message for invalid format
 */
function getFormatErrorMessage(provider: APIKeyProvider): string {
  const messages: Record<APIKeyProvider, string> = {
    openai: 'OpenAI API key should start with "sk-" and be at least 48 characters',
    anthropic: 'Anthropic API key should start with "sk-ant-" and be around 100 characters',
    google: 'Google API key should start with "AIza" and be 39 characters',
    azure: 'Azure API key should be a 32-character hexadecimal string',
  };

  return messages[provider] || 'Invalid API key format';
}

/**
 * Auto-detect provider from API key format
 */
export function detectProvider(apiKey: string): APIKeyProvider | null {
  const trimmedKey = apiKey.trim();

  if (trimmedKey.startsWith('sk-ant-')) return 'anthropic';
  if (trimmedKey.startsWith('sk-')) return 'openai';
  if (trimmedKey.startsWith('AIza')) return 'google';
  if (/^[a-f0-9]{32}$/.test(trimmedKey)) return 'azure';

  return null;
}

/**
 * Mask API key for display (show only first and last 4 chars)
 */
export function maskAPIKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) {
    return '••••••••••••';
  }

  const first = apiKey.substring(0, 7);
  const last = apiKey.substring(apiKey.length - 4);
  const middle = '•'.repeat(Math.min(20, apiKey.length - 11));

  return `${first}${middle}${last}`;
}

/**
 * Validate multiple API keys
 */
export function validateMultipleKeys(
  keys: Record<APIKeyProvider, string>
): Record<APIKeyProvider, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [provider, key] of Object.entries(keys)) {
    if (key && key.trim().length > 0) {
      results[provider] = validateAPIKeyFormat(key, provider as APIKeyProvider);
    }
  }

  return results as Record<APIKeyProvider, ValidationResult>;
}

/**
 * Get API key validation status for UI
 */
export interface KeyStatus {
  configured: boolean;
  valid: boolean;
  masked?: string;
  error?: string;
}

export function getKeyStatus(apiKey: string | undefined, provider: APIKeyProvider): KeyStatus {
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      configured: false,
      valid: false,
    };
  }

  const validation = validateAPIKeyFormat(apiKey, provider);

  return {
    configured: true,
    valid: validation.isValid,
    masked: maskAPIKey(apiKey),
    error: validation.error,
  };
}
