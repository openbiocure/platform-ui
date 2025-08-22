import { User, LoginCredentials, RegisterData } from '../types/auth';

// Backend API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const AUTH_API_URL = `${API_BASE_URL}/auth`;

// Token storage keys
const ACCESS_TOKEN_KEY = 'openbiocure_access_token';
const REFRESH_TOKEN_KEY = 'openbiocure_refresh_token';
const USER_KEY = 'openbiocure_user';

// Types for backend responses
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  tenant_id: string;
  session_key?: string;
}

interface LoginRequest {
  email: string;
  password: string;
  tenant_id?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  type: 'individual' | 'organization';
  organization?: string;
  tenant_id?: string;
}

// Utility functions for secure token storage
const setSecureItem = (key: string, value: string): void => {
  try {
    // In production, consider using secure storage libraries
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Failed to store item securely:', error);
  }
};

export const getSecureItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Failed to retrieve item securely:', error);
    return null;
  }
};

const removeSecureItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove item securely:', error);
  }
};

// HTTP client with auth headers
const createAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getSecureItem(ACCESS_TOKEN_KEY);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${getSecureItem(ACCESS_TOKEN_KEY)}`,
      };
      return fetch(url, { ...options, headers: newHeaders });
    } else {
      // Refresh failed, logout user
      logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

// Real backend authentication
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const loginRequest: LoginRequest = {
      email: credentials.email,
      password: credentials.password,
      // Optional: specify tenant_id if known
    };

    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(errorData.detail || 'Invalid credentials');
    }

    const tokenResponse: TokenResponse = await response.json();

    // Store tokens securely
    setSecureItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
    setSecureItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    setSecureItem(USER_KEY, JSON.stringify(tokenResponse.user));

    // Store session key for encryption if provided
    if (tokenResponse.session_key) {
      setSecureItem('session_key', tokenResponse.session_key);
    }

    return tokenResponse.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Legacy function name for compatibility
export const mockLogin = login;

// Real backend registration
export const register = async (data: RegisterData): Promise<User> => {
  try {
    const registerRequest: RegisterRequest = {
      email: data.email,
      password: data.password,
      name: data.name,
      type: data.type === 'organization' ? 'organization' : 'individual',
      organization: data.organization,
    };

    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(errorData.detail || 'Registration failed');
    }

    const tokenResponse: TokenResponse = await response.json();

    // Store tokens securely
    setSecureItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
    setSecureItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    setSecureItem(USER_KEY, JSON.stringify(tokenResponse.user));

    // Store session key for encryption if provided
    if (tokenResponse.session_key) {
      setSecureItem('session_key', tokenResponse.session_key);
    }

    return tokenResponse.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Legacy function name for compatibility
export const mockRegister = register;

// Token refresh functionality
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getSecureItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${AUTH_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const tokenResponse: TokenResponse = await response.json();

    // Update stored tokens
    setSecureItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
    setSecureItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

// Real backend logout
export const logout = async (): Promise<void> => {
  try {
    const accessToken = getSecureItem(ACCESS_TOKEN_KEY);
    
    if (accessToken) {
      // Notify backend about logout
      await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore logout errors - we'll clear local storage anyway
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    removeSecureItem(ACCESS_TOKEN_KEY);
    removeSecureItem(REFRESH_TOKEN_KEY);
    removeSecureItem(USER_KEY);
    removeSecureItem('session_key');
  }
};

// Get current user from secure storage
export const getCurrentUser = (): User | null => {
  try {
    const userStr = getSecureItem(USER_KEY);
    const accessToken = getSecureItem(ACCESS_TOKEN_KEY);
    
    if (!userStr || !accessToken) {
      return null;
    }

    // Basic token expiry check (JWT payload)
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          // Token expired, try to refresh
          refreshAccessToken().then(success => {
            if (!success) {
              logout();
            }
          });
          return null;
        }
      }
    } catch {
      // Invalid token format
      logout();
      return null;
    }
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting current user:', error);
    logout();
    return null;
  }
};

// Verify token with backend
export const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await createAuthenticatedRequest(`${AUTH_API_URL}/verify`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

// Get authentication headers for API calls
export const getAuthHeaders = (): { [key: string]: string } => {
  const accessToken = getSecureItem(ACCESS_TOKEN_KEY);
  return accessToken 
    ? { 'Authorization': `Bearer ${accessToken}` }
    : {};
};

// Legacy function names for compatibility
export const mockLogout = logout;
export const mockGetCurrentUser = getCurrentUser;

// Export authenticated fetch function for other services
export { createAuthenticatedRequest };
