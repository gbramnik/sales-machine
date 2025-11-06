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
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
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
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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
        const { supabase } = await import('./supabase');
        await supabase.auth.signOut();
        // Redirect will be handled by ProtectedRoute
        window.location.href = '/login';
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

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<{ success: true; data: any }>('/dashboard/stats');
  }

  async getDashboardPipeline() {
    return this.request<{ success: true; data: any }>('/dashboard/pipeline');
  }

  async getDashboardActivityStream(params?: { limit?: number }) {
    const query = params?.limit ? `?limit=${params.limit}` : '';
    return this.request<{ success: true; data: any }>(`/dashboard/activity-stream${query}`);
  }

  async getDashboardAlerts() {
    return this.request<{ success: true; data: any }>('/dashboard/alerts');
  }

  async dismissAlert(alertId: string) {
    return this.request(`/dashboard/alerts/${alertId}/dismiss`, {
      method: 'POST',
    });
  }

  // Review Queue endpoints (Story 5.3)
  async getReviewQueue(params?: { filter?: 'vip' | 'non_vip' | 'all' }) {
    const query = params?.filter ? `?filter=${params.filter}` : '';
    return this.request<{ success: true; data: any[]; vip_count?: number; non_vip_count?: number }>(`/ai-review-queue${query}`);
  }

  async approveReviewMessage(reviewId: string) {
    return this.request(`/ai-review-queue/${reviewId}/approve`, {
      method: 'POST',
    });
  }

  async editReviewMessage(reviewId: string, data: { edited_message?: string; edited_subject?: string }) {
    return this.request(`/ai-review-queue/${reviewId}/edit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectReviewMessage(reviewId: string, reason?: string) {
    return this.request(`/ai-review-queue/${reviewId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async bulkApproveReviewMessages(reviewIds: string[]) {
    return this.request('/ai-review-queue/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ review_ids: reviewIds }),
    });
  }

  async bulkRejectReviewMessages(reviewIds: string[], reason?: string) {
    return this.request('/ai-review-queue/bulk-reject', {
      method: 'POST',
      body: JSON.stringify({ review_ids: reviewIds, reason }),
    });
  }

  async getProspect(prospectId: string) {
    return this.request(`/prospects/${prospectId}`);
  }

  // Onboarding endpoints
  async startOnboarding() {
    return this.request<{ success: true; data: any }>('/onboarding/start', {
      method: 'POST',
    });
  }

  async getOnboardingStatus() {
    return this.request<{ success: true; data: { session: any; checklist: any } }>('/onboarding/status');
  }

  async saveGoalSelection(goal: '5-10' | '10-20' | '20-30') {
    return this.request<{ success: true; data: { session: any; current_step: string } }>('/onboarding/step/goal', {
      method: 'POST',
      body: JSON.stringify({ goal }),
    });
  }

  async getIndustries() {
    return this.request<{ success: true; data: { industries: string[] } }>('/onboarding/industries');
  }

  async saveIndustrySelection(industry: string) {
    return this.request<{ success: true; data: { session: any; current_step: string; icp_suggestions: any } }>('/onboarding/step/industry', {
      method: 'POST',
      body: JSON.stringify({ industry }),
    });
  }

  async getICPSuggestions(industry?: string) {
    const query = industry ? `?industry=${encodeURIComponent(industry)}` : '';
    return this.request<{ success: true; data: any }>(`/onboarding/step/icp/suggestions${query}`);
  }

  async saveICPConfig(icpConfig: {
    job_titles?: string[];
    company_sizes?: string[];
    locations?: string[];
  }) {
    return this.request<{ success: true; data: { session: any; current_step: string } }>('/onboarding/step/icp', {
      method: 'POST',
      body: JSON.stringify(icpConfig),
    });
  }

  async verifyDomain(domain: string) {
    return this.request<{ success: true; data: any }>('/onboarding/step/domain/verify', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  }

  async getCalendarOAuthUrl(provider: 'google' | 'outlook') {
    return this.request<{ success: true; data: { oauth_url: string; state: string } }>(`/onboarding/step/calendar/oauth-url?provider=${provider}`);
  }

  async handleCalendarOAuthCallback(code: string, state: string, provider: 'google' | 'outlook') {
    return this.request<{ success: true; data: any }>('/onboarding/step/calendar/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state, provider }),
    });
  }

  async getPreflightChecklist() {
    return this.request<{ success: true; data: any }>('/onboarding/preflight-checklist');
  }

  async completeOnboarding() {
    return this.request<{ success: true; data: { session: any; auto_config: any } }>('/onboarding/complete', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);



