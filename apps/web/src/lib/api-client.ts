/**
 * API Client for Sales Machine Backend
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp?: string;
    requestId?: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token from Supabase session
   */
  private async getAuthToken(): Promise<string | null> {
    // TODO: Replace with actual Supabase client once auth is set up
    // For now, return null (will need to be implemented)
    return null;
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: {
          code: 'UNKNOWN_ERROR',
          message: response.statusText || 'An error occurred',
        },
      }));

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // TODO: Redirect to login
        console.error('Unauthorized - redirecting to login');
      }

      throw new Error(error.error?.message || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Campaigns endpoints
  async getCampaigns(params?: { status?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    return this.request(`/campaigns${query.toString() ? `?${query}` : ''}`);
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`);
  }

  async createCampaign(data: any) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: string, data: any) {
    return this.request(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: string) {
    return this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async triggerLinkedInScrape(id: string, params: any) {
    return this.request(`/campaigns/${id}/trigger-scrape`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Settings endpoints
  async getApiCredentials() {
    return this.request('/settings/api-credentials');
  }

  async saveApiCredential(data: {
    service_name: string;
    api_key?: string;
    webhook_url?: string;
    metadata?: Record<string, any>;
  }) {
    return this.request('/settings/api-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteApiCredential(serviceName: string) {
    return this.request(`/settings/api-credentials/${serviceName}`, {
      method: 'DELETE',
    });
  }

  async verifyApiCredential(serviceName: string) {
    return this.request(`/settings/api-credentials/${serviceName}/verify`, {
      method: 'POST',
    });
  }

  async getICPConfig() {
    return this.request('/settings/icp');
  }

  async saveICPConfig(data: {
    industries?: string[];
    job_titles?: string[];
    company_sizes?: string[];
    locations?: string[];
    technologies?: string[];
    exclude_industries?: string[];
    exclude_companies?: string[];
  }) {
    return this.request('/settings/icp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEmailSettings() {
    return this.request('/settings/email');
  }

  async saveEmailSettings(data: {
    domain?: string;
    sending_email?: string;
    daily_limit?: number;
    warm_up_enabled?: boolean;
    warm_up_days_required?: number;
    bounce_rate_threshold?: number;
  }) {
    return this.request('/settings/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyDomain(domain: string) {
    return this.request('/settings/email/verify-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  }

  async getAISettings() {
    return this.request('/settings/ai');
  }

  async saveAISettings(data: {
    personality_id?: string;
    tone?: 'professional' | 'casual' | 'friendly' | 'formal';
    confidence_threshold?: number;
    use_vip_mode?: boolean;
    response_templates?: string[];
  }) {
    return this.request('/settings/ai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllSettings() {
    return this.request('/settings/all');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);


