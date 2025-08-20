import { createAuthenticatedRequest, getAuthHeaders } from './authService';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Generic API service for making authenticated requests
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await createAuthenticatedRequest(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await createAuthenticatedRequest(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await createAuthenticatedRequest(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await createAuthenticatedRequest(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await createAuthenticatedRequest(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const authHeaders = getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...authHeaders,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || errorData.detail || `Upload Error: ${response.status}`);
    }

    return response.json();
  }
}

// Default API service instance
export const apiService = new ApiService();

// Specific service instances for different APIs
export const authApiService = new ApiService(`${API_BASE_URL}/auth`);
export const analyticsApiService = new ApiService(`${API_BASE_URL}/analytics`);

// Example service methods for common operations
export const userService = {
  // Get user profile
  getProfile: () => apiService.get('/user/profile'),
  
  // Update user profile
  updateProfile: (data: any) => apiService.put('/user/profile', data),
  
  // Get user preferences
  getPreferences: () => apiService.get('/user/preferences'),
  
  // Update user preferences
  updatePreferences: (preferences: any) => apiService.put('/user/preferences', preferences),
};

export const researchService = {
  // Get research projects
  getProjects: (params?: Record<string, string>) => apiService.get('/research/projects', params),
  
  // Create new research project
  createProject: (data: any) => apiService.post('/research/projects', data),
  
  // Get project by ID
  getProject: (id: string) => apiService.get(`/research/projects/${id}`),
  
  // Update project
  updateProject: (id: string, data: any) => apiService.put(`/research/projects/${id}`, data),
  
  // Delete project
  deleteProject: (id: string) => apiService.delete(`/research/projects/${id}`),
  
  // Upload research data
  uploadData: (projectId: string, file: File) => 
    apiService.upload(`/research/projects/${projectId}/upload`, file, { project_id: projectId }),
};

export const analyticsService = {
  // Get usage analytics
  getUsageStats: (period?: string) => analyticsApiService.get('/usage', period ? { period } : undefined),
  
  // Get performance metrics
  getPerformanceMetrics: () => analyticsApiService.get('/performance'),
  
  // Track user event
  trackEvent: (event: string, data?: any) => analyticsApiService.post('/events', { event, data }),
};

export default apiService;
