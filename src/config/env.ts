/**
 * Environment configuration
 * Centralized place for all environment-dependent settings
 */

export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  version: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  features: {
    enableGoogleDrive: boolean;
    enableAIProviders: boolean;
    enableMockMode: boolean;
  };
}

// Get environment from build process
const NODE_ENV = process.env.NODE_ENV || 'development';

export const config: AppConfig = {
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  version: '1.0.0', // Should match package.json
  logLevel: NODE_ENV === 'development' ? 'debug' : 'warn',
  features: {
    enableGoogleDrive: true,
    enableAIProviders: true,
    enableMockMode: NODE_ENV === 'development',
  },
};

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const requiredVars: string[] = [];

  // Add any required environment variables here
  // Example: if (!process.env.REACT_APP_API_URL) requiredVars.push('REACT_APP_API_URL');

  if (requiredVars.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredVars.join(', ')}`);
  }
}

// Validate on module load
validateConfig();
