/**
 * Google OAuth2 Authentication for Chrome Extension
 * Handles authentication flow and token management
 */

export interface GoogleAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

const STORAGE_KEY = 'google_auth_token';
const TOKEN_EXPIRY_KEY = 'google_token_expiry';

/**
 * Authenticate with Google using Chrome Identity API
 * Returns access token if successful
 */
export async function authenticateWithGoogle(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error('Auth error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message || 'Authentication failed'));
        return;
      }

      if (!token) {
        reject(new Error('No token received'));
        return;
      }

      // Store token and expiry (tokens typically expire in 1 hour)
      const expiryTime = Date.now() + 3600 * 1000;
      chrome.storage.local.set({
        [STORAGE_KEY]: token,
        [TOKEN_EXPIRY_KEY]: expiryTime
      });

      resolve(token);
    });
  });
}

/**
 * Get current auth token from storage or authenticate if needed
 */
export async function getAuthToken(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if we have a valid token in storage
      const result = await chrome.storage.local.get([STORAGE_KEY, TOKEN_EXPIRY_KEY]);
      const token = result[STORAGE_KEY];
      const expiry = result[TOKEN_EXPIRY_KEY];

      // If token exists and hasn't expired, return it
      if (token && expiry && Date.now() < expiry) {
        resolve(token);
        return;
      }

      // Otherwise, authenticate
      const newToken = await authenticateWithGoogle();
      resolve(newToken);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Revoke the current auth token (sign out)
 */
export async function revokeAuthToken(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (!token) {
        // No token to revoke
        chrome.storage.local.remove([STORAGE_KEY, TOKEN_EXPIRY_KEY]);
        resolve();
        return;
      }

      chrome.identity.removeCachedAuthToken({ token }, () => {
        // Revoke token on Google's servers
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
          .then(() => {
            chrome.storage.local.remove([STORAGE_KEY, TOKEN_EXPIRY_KEY]);
            resolve();
          })
          .catch((error) => {
            console.error('Token revocation error:', error);
            // Still clear local storage even if revocation fails
            chrome.storage.local.remove([STORAGE_KEY, TOKEN_EXPIRY_KEY]);
            resolve();
          });
      });
    });
  });
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY, TOKEN_EXPIRY_KEY]);
    const token = result[STORAGE_KEY];
    const expiry = result[TOKEN_EXPIRY_KEY];

    return !!(token && expiry && Date.now() < expiry);
  } catch (error) {
    return false;
  }
}

/**
 * Get user profile information from Google
 */
export async function getUserProfile(): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  const token = await getAuthToken();

  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}
