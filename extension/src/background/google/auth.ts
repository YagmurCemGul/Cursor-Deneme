// Google OAuth authentication for Chrome extensions
export interface TokenInfo {
  accessToken: string;
  expiresAt: number;
  scopes: string[];
}

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/gmail.compose",
];

export async function getAuthToken(interactive: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!token) {
        reject(new Error("No token received"));
        return;
      }
      resolve(token);
    });
  });
}

export async function removeAuthToken(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      // Also revoke the token
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(() => resolve())
        .catch(reject);
    });
  });
}

export async function getTokenInfo(): Promise<TokenInfo | null> {
  try {
    const token = await getAuthToken(false);
    
    // Verify token with Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    return {
      accessToken: token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      scopes: data.scope?.split(" ") || [],
    };
  } catch (error) {
    console.error("Failed to get token info:", error);
    return null;
  }
}

export async function disconnect(): Promise<void> {
  const token = await getAuthToken(false);
  await removeAuthToken(token);
  
  // Clear stored settings
  await chrome.storage.local.remove(["googleTokenMetadata"]);
}

export async function ensureAuth(): Promise<string> {
  // Try to get cached token first
  const tokenInfo = await getTokenInfo();
  
  if (tokenInfo && tokenInfo.expiresAt > Date.now() + 60000) {
    // Token is valid for at least 1 more minute
    return tokenInfo.accessToken;
  }
  
  // Need to get a new token
  return getAuthToken(true);
}
