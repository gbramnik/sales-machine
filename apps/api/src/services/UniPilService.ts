import { ApiError, ErrorCode } from '../types';

/**
 * UniPil API Service
 * 
 * Handles all LinkedIn automation operations via UniPil API:
 * - Profile search
 * - Company page extraction
 * - Warm-up actions (like, comment)
 * - Connection requests
 * - Messaging
 * 
 * Rate Limits: 20 prospects/day (default), 40/day (max)
 * Cost: 5€/compte LinkedIn/month
 */

// Configuration
const UNIPIL_API_URL = process.env.UNIPIL_API_URL || 'https://api.unipil.io';
const UNIPIL_API_KEY = process.env.UNIPIL_API_KEY;

// Rate limiting configuration
const DEFAULT_DAILY_LIMIT = 20;
const MAX_DAILY_LIMIT = 40;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

// Types
export interface SearchProfilesParams {
  industry?: string;
  location?: string;
  job_title?: string;
  company_size?: string;
}

export interface UniPilProfile {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  job_title?: string;
  company_name?: string;
  linkedin_url?: string;
  location?: string;
  profile_summary?: string;
  profile_picture_url?: string;
  email?: string;
  phone?: string;
}

export interface CompanyPageData {
  company_name: string;
  linkedin_url: string;
  website?: string;
  description?: string;
  industry?: string;
  company_size?: string;
  headquarters?: string;
}

export interface UniPilResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface RateLimitInfo {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * UniPil Service
 * 
 * Handles all LinkedIn automation via UniPil API with:
 * - Retry logic (exponential backoff)
 * - Rate limiting awareness
 * - Error handling
 * - Standardized response format
 */
export class UniPilService {
  /**
   * Get API key from environment or throw error
   */
  private static getApiKey(): string {
    if (!UNIPIL_API_KEY) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'UniPil API key not configured. Set UNIPIL_API_KEY environment variable.',
        500
      );
    }
    return UNIPIL_API_KEY;
  }

  /**
   * Make HTTP request to UniPil API with retry logic
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const url = `${UNIPIL_API_URL}${endpoint}`;
    const apiKey = this.getApiKey();

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        
        // Retry on 5xx errors (server errors)
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          await sleep(RETRY_DELAYS[retryCount]);
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }

        // Map HTTP errors to API errors
        if (response.status === 401) {
          throw new ApiError(
            ErrorCode.UNAUTHORIZED,
            'UniPil API key is invalid or expired',
            401,
            errorData
          );
        }

        if (response.status === 429) {
          throw new ApiError(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'UniPil API rate limit exceeded. Daily limit reached.',
            429,
            errorData
          );
        }

        throw new ApiError(
          ErrorCode.SERVICE_UNAVAILABLE,
          `UniPil API error: ${errorData?.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      // Retry on network errors
      if (error instanceof TypeError && retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAYS[retryCount]);
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      // Re-throw ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap other errors
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        `UniPil API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Check rate limit before making API call
   * 
   * Note: This is a basic check. Full rate limiting should be implemented
   * in RateLimitService using Upstash Redis for multi-user tracking.
   * 
   * @param userId User ID for rate limit tracking
   * @param dailyLimit User's configured daily limit (default: 20, max: 40)
   * @returns Rate limit info
   */
  static async checkRateLimit(
    _userId: string,
    dailyLimit: number = DEFAULT_DAILY_LIMIT
  ): Promise<RateLimitInfo> {
    // TODO: Implement full rate limiting using RateLimitService
    // For now, return basic info
    // In production, this should check Redis counter for user's daily usage
    
    const limit = Math.min(Math.max(dailyLimit, DEFAULT_DAILY_LIMIT), MAX_DAILY_LIMIT);
    
    return {
      dailyLimit: limit,
      used: 0, // TODO: Get from Redis
      remaining: limit,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };
  }

  /**
   * Search LinkedIn profiles matching criteria
   * 
   * @param params Search parameters (industry, location, job_title, company_size)
   * @returns Array of prospect profiles
   */
  static async searchProfiles(
    params: SearchProfilesParams
  ): Promise<UniPilProfile[]> {
    // TODO: Confirm exact endpoint path with UniPil API documentation
    const endpoint = '/api/v1/linkedin/search';
    
    const response = await this.makeRequest<UniPilResponse<UniPilProfile[]>>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          industry: params.industry,
          location: params.location,
          job_title: params.job_title,
          company_size: params.company_size,
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        response.error?.message || 'UniPil profile search failed',
        500,
        response.error
      );
    }

    return response.data;
  }

  /**
   * Get company page data from LinkedIn
   * 
   * @param companyLinkedInUrl LinkedIn company page URL
   * @returns Company data
   */
  static async getCompanyPage(
    companyLinkedInUrl: string
  ): Promise<CompanyPageData> {
    // TODO: Confirm exact endpoint path with UniPil API documentation
    // Assuming endpoint format: /api/v1/linkedin/company/{companyUrl}
    const encodedUrl = encodeURIComponent(companyLinkedInUrl);
    const endpoint = `/api/v1/linkedin/company/${encodedUrl}`;
    
    const response = await this.makeRequest<UniPilResponse<CompanyPageData>>(
      endpoint,
      {
        method: 'GET',
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        response.error?.message || 'UniPil company page extraction failed',
        500,
        response.error
      );
    }

    return response.data;
  }

  /**
   * Like a LinkedIn post (for warm-up)
   * 
   * @param postUrl LinkedIn post URL
   * @returns Success status
   */
  static async likePost(postUrl: string): Promise<{ success: boolean }> {
    // TODO: Confirm exact endpoint path with UniPil API documentation
    const endpoint = '/api/v1/linkedin/like';
    
    const response = await this.makeRequest<UniPilResponse<{ success: boolean }>>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          post_url: postUrl,
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        response.error?.message || 'UniPil like action failed',
        500,
        response.error
      );
    }

    return response.data;
  }

  /**
   * Comment on a LinkedIn post (for warm-up)
   * 
   * @param postUrl LinkedIn post URL
   * @param comment Comment text
   * @returns Success status
   */
  static async commentOnPost(
    postUrl: string,
    comment: string
  ): Promise<{ success: boolean }> {
    // TODO: Confirm exact endpoint path with UniPil API documentation
    const endpoint = '/api/v1/linkedin/comment';
    
    const response = await this.makeRequest<UniPilResponse<{ success: boolean }>>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          post_url: postUrl,
          comment: comment,
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        response.error?.message || 'UniPil comment action failed',
        500,
        response.error
      );
    }

    return response.data;
  }

  /**
   * Send LinkedIn connection request
   * 
   * @param linkedinUrl LinkedIn profile URL
   * @param message Personalized invitation message
   * @returns Connection request status
   */
  static async sendConnectionRequest(
    linkedinUrl: string,
    message: string
  ): Promise<{ success: boolean; request_id?: string }> {
    // TODO: Confirm exact endpoint path with UniPil API documentation
    const endpoint = '/api/v1/linkedin/connection-request';
    
    const response = await this.makeRequest<UniPilResponse<{ success: boolean; request_id?: string }>>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          message: message,
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        response.error?.message || 'UniPil connection request failed',
        500,
        response.error
      );
    }

    return response.data;
  }

  /**
   * Send LinkedIn message
   * 
   * @param linkedinUrl LinkedIn profile URL
   * @param message Message text
   * @returns Message sent status
   */
  static async sendMessage(
    linkedinUrl: string,
    message: string
  ): Promise<{ success: boolean; message_id?: string }> {
    // TODO: Confirm exact endpoint path with UniPil API documentation
    const endpoint = '/api/v1/linkedin/message';
    
    const response = await this.makeRequest<UniPilResponse<{ success: boolean; message_id?: string }>>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          message: message,
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        response.error?.message || 'UniPil message sending failed',
        500,
        response.error
      );
    }

    return response.data;
  }
}

