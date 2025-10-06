/**
 * Internationalization utilities
 * Wraps Chrome i18n API with React-friendly hooks
 */

export function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

export function getCurrentLanguage(): string {
  return chrome.i18n.getUILanguage().split('-')[0]; // en-US -> en
}

export const i18n = {
  get: t,
  lang: getCurrentLanguage,
};

export default i18n;
