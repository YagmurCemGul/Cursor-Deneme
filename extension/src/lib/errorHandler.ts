/**
 * Centralized Error Handler
 * Provides consistent error handling and user-friendly messages
 */

import type { Language } from './i18n';

export enum ErrorType {
  API_KEY_MISSING = 'api_key_missing',
  API_KEY_INVALID = 'api_key_invalid',
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  STORAGE = 'storage',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

/**
 * Error messages in Turkish and English
 */
const ERROR_MESSAGES: Record<ErrorType, Record<Language, ErrorMessage>> = {
  [ErrorType.API_KEY_MISSING]: {
    tr: {
      title: 'API Anahtarı Bulunamadı',
      message: 'Yapay zeka özelliklerini kullanmak için API anahtarınızı yapılandırmanız gerekiyor.',
      action: 'Ayarlara Git',
    },
    en: {
      title: 'API Key Not Found',
      message: 'You need to configure your API key to use AI features.',
      action: 'Go to Settings',
    },
  },
  [ErrorType.API_KEY_INVALID]: {
    tr: {
      title: 'Geçersiz API Anahtarı',
      message: 'API anahtarınız geçersiz görünüyor. Lütfen kontrol edip tekrar deneyin.',
      action: 'API Anahtarını Kontrol Et',
    },
    en: {
      title: 'Invalid API Key',
      message: 'Your API key appears to be invalid. Please check and try again.',
      action: 'Check API Key',
    },
  },
  [ErrorType.RATE_LIMIT]: {
    tr: {
      title: 'Çok Fazla İstek',
      message: 'API kullanım limitinize ulaştınız. Lütfen birkaç dakika bekleyip tekrar deneyin.',
      action: 'Daha Sonra Dene',
    },
    en: {
      title: 'Too Many Requests',
      message: 'You have reached your API rate limit. Please wait a few minutes and try again.',
      action: 'Try Later',
    },
  },
  [ErrorType.NETWORK]: {
    tr: {
      title: 'Bağlantı Hatası',
      message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
      action: 'Tekrar Dene',
    },
    en: {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      action: 'Retry',
    },
  },
  [ErrorType.TIMEOUT]: {
    tr: {
      title: 'Zaman Aşımı',
      message: 'İstek çok uzun sürdü. Lütfen tekrar deneyin.',
      action: 'Tekrar Dene',
    },
    en: {
      title: 'Timeout',
      message: 'The request took too long. Please try again.',
      action: 'Retry',
    },
  },
  [ErrorType.VALIDATION]: {
    tr: {
      title: 'Geçersiz Veri',
      message: 'Girdiğiniz bilgileri kontrol edin ve tekrar deneyin.',
      action: 'Bilgileri Kontrol Et',
    },
    en: {
      title: 'Invalid Data',
      message: 'Please check your input and try again.',
      action: 'Check Input',
    },
  },
  [ErrorType.STORAGE]: {
    tr: {
      title: 'Depolama Hatası',
      message: 'Veriler kaydedilirken bir hata oluştu.',
      action: 'Tekrar Dene',
    },
    en: {
      title: 'Storage Error',
      message: 'An error occurred while saving data.',
      action: 'Retry',
    },
  },
  [ErrorType.UNKNOWN]: {
    tr: {
      title: 'Bilinmeyen Hata',
      message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
      action: 'Tekrar Dene',
    },
    en: {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      action: 'Retry',
    },
  },
};

/**
 * Classify error based on message and status code
 */
export function classifyError(error: any): ErrorType {
  const errorMessage = error?.message?.toLowerCase() || error?.toString()?.toLowerCase() || '';

  // API Key errors
  if (
    errorMessage.includes('api key not set') ||
    errorMessage.includes('no api key found') ||
    errorMessage.includes('api key is required')
  ) {
    return ErrorType.API_KEY_MISSING;
  }

  if (
    errorMessage.includes('invalid api key') ||
    errorMessage.includes('incorrect api key') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('401')
  ) {
    return ErrorType.API_KEY_INVALID;
  }

  // Rate limit errors
  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('429')
  ) {
    return ErrorType.RATE_LIMIT;
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('offline')
  ) {
    return ErrorType.NETWORK;
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return ErrorType.TIMEOUT;
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return ErrorType.VALIDATION;
  }

  // Storage errors
  if (errorMessage.includes('storage') || errorMessage.includes('quota')) {
    return ErrorType.STORAGE;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Create an AppError from any error
 */
export function createAppError(error: any, context?: Record<string, any>): AppError {
  const type = classifyError(error);

  return {
    type,
    message: error?.message || error?.toString() || 'Unknown error',
    originalError: error instanceof Error ? error : undefined,
    timestamp: new Date(),
    context,
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: AppError, language: Language = 'en'): ErrorMessage {
  return ERROR_MESSAGES[error.type][language];
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(
  error: any,
  language: Language = 'en',
  context?: Record<string, any>
): string {
  const appError = createAppError(error, context);
  const errorMsg = getErrorMessage(appError, language);

  let formatted = `${errorMsg.title}\n\n${errorMsg.message}`;

  if (errorMsg.action) {
    formatted += `\n\n💡 ${errorMsg.action}`;
  }

  // Add technical details in development
  if (process.env.NODE_ENV === 'development' && appError.originalError) {
    formatted += `\n\n[Debug] ${appError.originalError.message}`;
  }

  return formatted;
}

/**
 * Log error for debugging
 */
export function logError(error: AppError): void {
  console.group(`🔴 Error: ${error.type}`);
  console.error('Message:', error.message);
  console.error('Timestamp:', error.timestamp.toISOString());
  if (error.context) {
    console.error('Context:', error.context);
  }
  if (error.originalError) {
    console.error('Original Error:', error.originalError);
  }
  console.groupEnd();
}

/**
 * Handle error with logging and user notification
 */
export function handleError(
  error: any,
  language: Language = 'en',
  context?: Record<string, any>
): AppError {
  const appError = createAppError(error, context);
  logError(appError);
  return appError;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(errorType: ErrorType): boolean {
  return [
    ErrorType.RATE_LIMIT,
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
  ].includes(errorType);
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(errorType: ErrorType, attempt: number): number {
  if (!isRetryableError(errorType)) {
    return 0;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  const baseDelay = 1000;
  const maxDelay = 30000; // 30 seconds max

  if (errorType === ErrorType.RATE_LIMIT) {
    // For rate limits, use longer delays
    const delay = Math.min(baseDelay * Math.pow(2, attempt) * 2, maxDelay);
    return delay;
  }

  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return delay;
}
