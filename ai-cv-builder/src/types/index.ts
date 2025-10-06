// Re-export all types from here
export * from './user.types'
export * from './cv.types'
export * from './job.types'
export * from './api.types'

// Common types
export type ID = string
export type Timestamp = string | Date

export interface BaseEntity {
  id: ID
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Language = 'en' | 'tr'

export type Theme = 'light' | 'dark' | 'system'

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
