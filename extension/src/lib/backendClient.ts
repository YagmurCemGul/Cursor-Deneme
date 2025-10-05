/**
 * Backend API Client
 * Connects Chrome Extension to Backend Server
 */

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * Get auth token from storage
 */
async function getAuthToken(): Promise<string | null> {
  const result = await chrome.storage.local.get('auth_token');
  return result.auth_token || null;
}

/**
 * Save auth token to storage
 */
async function saveAuthToken(token: string): Promise<void> {
  await chrome.storage.local.set({ auth_token: token });
}

/**
 * Clear auth token from storage
 */
async function clearAuthToken(): Promise<void> {
  await chrome.storage.local.remove('auth_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Unknown Error',
      message: response.statusText
    }));

    // Handle authentication errors
    if (response.status === 401) {
      await clearAuthToken();
      throw new Error('Session expired. Please login again.');
    }

    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
}

// ======================
// AUTHENTICATION
// ======================

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  // Save token
  await saveAuthToken(response.token);

  return response;
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  // Save token
  await saveAuthToken(response.token);

  return response;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await clearAuthToken();
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  return apiRequest('/api/auth/me');
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  
  if (!token) {
    return false;
  }

  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    await clearAuthToken();
    return false;
  }
}

// ======================
// AI PROXY
// ======================

export interface AIGenerateRequest {
  prompt: string;
  provider?: 'openai' | 'anthropic' | 'google';
  model?: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface AIGenerateResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
  latency: number;
}

/**
 * Generate AI response via backend proxy
 * This is secure - API keys stay on server!
 */
export async function generateAI(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  return apiRequest<AIGenerateResponse>('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

// ======================
// RESUMES
// ======================

export interface Resume {
  id: string;
  title: string;
  content: any;
  atsScore?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all resumes
 */
export async function getResumes(): Promise<Resume[]> {
  return apiRequest<Resume[]>('/api/resumes');
}

/**
 * Get single resume
 */
export async function getResume(id: string): Promise<Resume> {
  return apiRequest<Resume>(`/api/resumes/${id}`);
}

/**
 * Create resume
 */
export async function createResume(data: {
  title: string;
  content: any;
  atsScore?: number;
}): Promise<Resume> {
  return apiRequest<Resume>('/api/resumes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Update resume
 */
export async function updateResume(id: string, data: Partial<Resume>): Promise<Resume> {
  return apiRequest<Resume>(`/api/resumes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Delete resume
 */
export async function deleteResume(id: string): Promise<void> {
  await apiRequest(`/api/resumes/${id}`, {
    method: 'DELETE'
  });
}

// ======================
// JOBS
// ======================

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  url?: string;
  location?: string;
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all jobs
 */
export async function getJobs(): Promise<Job[]> {
  return apiRequest<Job[]>('/api/jobs');
}

/**
 * Create job
 */
export async function createJob(data: {
  title: string;
  company: string;
  description: string;
  url?: string;
  location?: string;
  salary?: string;
}): Promise<Job> {
  return apiRequest<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ======================
// USER
// ======================

/**
 * Get user profile
 */
export async function getUserProfile() {
  return apiRequest('/api/users/profile');
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: { name: string }) {
  return apiRequest('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Get API usage statistics
 */
export async function getAPIUsage() {
  return apiRequest('/api/users/usage');
}

// ======================
// HEALTH CHECK
// ======================

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  uptime: number;
  timestamp: string;
}> {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}
