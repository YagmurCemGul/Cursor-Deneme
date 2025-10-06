export const APP_NAME = 'AI CV Builder'
export const APP_VERSION = '1.0.0'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

export const SUPPORTED_LANGUAGES = ['en', 'tr'] as const
export const DEFAULT_LANGUAGE = 'en'

export const SUPPORTED_FILE_TYPES = {
  CV: ['.pdf', '.docx', '.doc', '.txt'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.webp'],
  VIDEO: ['.mp4', '.webm', '.mov'],
} as const

export const MAX_FILE_SIZE = {
  CV: 5 * 1024 * 1024, // 5MB
  IMAGE: 2 * 1024 * 1024, // 2MB
  VIDEO: 50 * 1024 * 1024, // 50MB
} as const

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CV_BUILDER: '/cv-builder',
  COVER_LETTER: '/cover-letter',
  JOBS: '/jobs',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

export const LOCAL_STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const
