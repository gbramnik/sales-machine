import { ApiError, ErrorCode } from '../types';
import { supabaseAdmin } from '../lib/supabase';

/**
 * Meeting Booking Service
 * 
 * Handles meeting booking via Cal.com API.
 * Generates booking links with prospect context pre-filled.
 * 
 * Provider: Cal.com (self-hosted or hosted)
 * Documentation: https://cal.com/docs/api
 */

// Configuration
const CAL_COM_API_URL = process.env.CAL_COM_API_URL || process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1';
const CAL_COM_API_KEY = process.env.CAL_COM_API_KEY;

// Types
export interface BookingLinkParams {
  prospectId: string;
  userId: string;
  eventTypeId?: string; // Optional: specific event type ID
  duration?: number; // Default: 30 minutes
}

export interface BookingLinkResponse {
  booking_link: string;
  booking_id: string;
  scheduled_at?: string; // If booking is pre-scheduled
}

export interface CalComBookingRequest {
  eventTypeId: string;
  startTime: string; // ISO 8601 timestamp
  endTime: string; // ISO 8601 timestamp
  responses: {
    name: string;
    email: string;
    notes?: string;
    metadata?: Record<string, any>;
  };
  timeZone?: string;
}

export interface CalComBookingResponse {
  id: string;
  uid: string;
  bookingUid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  location?: string;
  attendees: Array<{
    email: string;
    name: string;
  }>;
  metadata?: Record<string, any>;
}

export interface MeetingBookingCredentials {
  api_key: string;
  base_url?: string;
  oauth_client_id?: string;
  oauth_client_secret?: string;
  metadata?: Record<string, any>;
}

export class MeetingBookingService {
  /**
   * Generate booking link for a prospect
   * 
   * @param params - Booking link parameters
   * @returns Booking link URL and booking ID
   */
  async generateBookingLink(params: BookingLinkParams): Promise<BookingLinkResponse> {
    const { prospectId, userId, eventTypeId, duration = 30 } = params;

    // 1. Fetch prospect data
    const { data: prospect, error: prospectError } = await supabaseAdmin
      .from('prospects')
      .select('id, name, email, company, job_title, linkedin_url, list_id')
      .eq('id', prospectId)
      .single();

    if (prospectError || !prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404
      );
    }

    // Verify ownership via list
    const prospectWithListId = prospect as { id: string; name: string; email: string; company: string; job_title: string; linkedin_url: string; list_id: string };
    const { data: listData } = await supabaseAdmin
      .from('lists')
      .select('user_id')
      .eq('id', prospectWithListId.list_id)
      .eq('user_id', userId)
      .single();

    if (!listData) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'Access denied to this prospect',
        403
      );
    }

    // 2. Fetch enrichment data for meeting topic
    const { data: enrichment } = await supabaseAdmin
      .from('prospect_enrichment')
      .select('talking_points, company_insights')
      .eq('prospect_id', prospectId)
      .single();

    // 3. Get user calendar credentials
    const credentials = await this.getCalendarCredentials(userId);

    // 4. Get event type ID (use default if not provided)
    const eventType = eventTypeId || await this.getDefaultEventType(userId, credentials);

    // 5. Build booking metadata
    const meetingTopic = enrichment?.talking_points?.[0] || 'Discovery Call';
    const metadata = {
      prospect_id: prospectId,
      company: prospect.company || '',
      meeting_topic: meetingTopic,
      job_title: prospect.job_title || '',
    };

    // 6. Generate booking link via Cal.com API
    try {
      const bookingLink = await this.createBookingLink(
        credentials,
        {
          eventTypeId: eventType,
          prospectName: prospect.name || 'Prospect',
          prospectEmail: prospect.email || '',
          metadata,
          duration,
        }
      );

      return {
        booking_link: bookingLink.url,
        booking_id: bookingLink.bookingId,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        `Failed to generate booking link: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Get calendar credentials for user (with automatic token refresh)
   */
  private async getCalendarCredentials(userId: string): Promise<MeetingBookingCredentials> {
    // Get user's calendar provider
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('calendar_provider, calendar_access_token, calendar_token_expires_at')
      .eq('id', userId)
      .single();

    if (!user?.calendar_provider) {
      // Fallback to api_credentials table
      const { data: credentials } = await supabaseAdmin
        .from('api_credentials')
        .select('api_key, metadata, service_name')
        .eq('user_id', userId)
        .in('service_name', ['cal_com', 'calendly', 'calcom'])
        .eq('is_active', true)
        .single();

      if (credentials) {
        const provider = credentials.service_name === 'calcom' ? 'cal_com' : credentials.service_name as 'cal_com' | 'calendly';
        // Check if we have OAuth token (from users table) or API key
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('calendar_provider, calendar_access_token, calendar_token_expires_at')
          .eq('id', userId)
          .single();

        if (user?.calendar_provider && user.calendar_access_token) {
          // Use OAuth token with refresh
          const validToken = await this.getValidAccessToken(userId, provider);
          return {
            api_key: validToken,
            base_url: credentials.metadata?.base_url || CAL_COM_API_URL,
            oauth_client_id: credentials.metadata?.oauth_client_id,
            oauth_client_secret: credentials.metadata?.oauth_client_secret,
            metadata: credentials.metadata,
          };
        }

        // Use API key directly (no OAuth)
        return {
          api_key: credentials.api_key || '',
          base_url: credentials.metadata?.base_url || CAL_COM_API_URL,
          oauth_client_id: credentials.metadata?.oauth_client_id,
          oauth_client_secret: credentials.metadata?.oauth_client_secret,
          metadata: credentials.metadata,
        };
      }

      // Final fallback to environment variables
      const apiKey = CAL_COM_API_KEY;
      if (!apiKey) {
        throw new ApiError(
          ErrorCode.INVALID_CONFIG,
          'Calendar not connected. Please connect your calendar in onboarding.',
          400
        );
      }

      return {
        api_key: apiKey,
        base_url: CAL_COM_API_URL,
      };
    }

    // Use OAuth token with automatic refresh
    const provider = user.calendar_provider as 'cal_com' | 'calendly';
    const validToken = await this.getValidAccessToken(userId, provider);

    // Get full credentials from api_credentials table
    const { data: credentials } = await supabaseAdmin
      .from('api_credentials')
      .select('metadata')
      .eq('user_id', userId)
      .eq('service_name', provider === 'cal_com' ? 'cal_com' : 'calendly')
      .single();

    return {
      api_key: validToken,
      base_url: credentials?.metadata?.base_url || (provider === 'cal_com' ? CAL_COM_API_URL : 'https://api.calendly.com'),
      oauth_client_id: credentials?.metadata?.oauth_client_id,
      oauth_client_secret: credentials?.metadata?.oauth_client_secret,
      metadata: credentials?.metadata,
    };
  }

  /**
   * Get default event type for user
   */
  private async getDefaultEventType(
    _userId: string,
    credentials: MeetingBookingCredentials
  ): Promise<string> {
    try {
      // Call Cal.com API to get event types
      const response = await fetch(`${credentials.base_url}/event-types`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API call fails, return a default event type ID
        // This should be configured per user, but for MVP we use a default
        throw new Error('Failed to fetch event types');
      }

      const data = await response.json() as any;
      const eventTypes = data.event_types || data.data || [];

      // Return first event type or a default
      if (eventTypes.length > 0) {
        return eventTypes[0].id || eventTypes[0].slug;
      }

      // Default event type (should be configured in user settings)
      throw new ApiError(
        ErrorCode.INVALID_CONFIG,
        'No event types configured. Please configure a default event type in Cal.com.',
        400
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Return a default event type slug (user must configure this)
      // For MVP, we'll require eventTypeId to be provided or configured
      throw new ApiError(
        ErrorCode.INVALID_CONFIG,
        'Unable to determine default event type. Please provide eventTypeId or configure default event type.',
        400
      );
    }
  }

  /**
   * Create booking link via Cal.com API
   */
  private async createBookingLink(
    credentials: MeetingBookingCredentials,
    params: {
      eventTypeId: string;
      prospectName: string;
      prospectEmail: string;
      metadata: Record<string, any>;
      duration: number;
    }
  ): Promise<{ url: string; bookingId: string }> {
    
    // Cal.com API: Create a booking link
    // For booking links, we can use the event type URL directly with pre-filled metadata
    // Or use the booking API to create a pending booking
    
    // Option 1: Generate booking link URL with query params
    // Format: https://cal.com/{username}/{event-type-slug}?name={name}&email={email}&metadata={metadata}
    
    // For now, we'll construct the booking link URL
    // In production, this should use Cal.com's booking API to create a booking link
    
    // Extract username from eventTypeId or use a default
    // For MVP, we'll use the eventTypeId as the slug
    const eventSlug = params.eventTypeId.includes('/') 
      ? params.eventTypeId.split('/').pop() 
      : params.eventTypeId;
    
    // Get Cal.com username from credentials or config
    const calUsername = credentials.metadata?.username || process.env.CAL_COM_USERNAME || 'default';
    
    // Build booking link with pre-filled data
    const bookingUrl = new URL(`https://cal.com/${calUsername}/${eventSlug}`);
    bookingUrl.searchParams.set('name', params.prospectName);
    if (params.prospectEmail) {
      bookingUrl.searchParams.set('email', params.prospectEmail);
    }
    bookingUrl.searchParams.set('metadata', JSON.stringify(params.metadata));
    
    // Generate a unique booking ID for tracking
    const bookingId = `cal_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      url: bookingUrl.toString(),
      bookingId,
    };
  }

  /**
   * Refresh expired access token
   * 
   * @param userId - User ID
   * @param provider - Calendar provider ('cal_com' or 'calendly')
   * @returns New access token and expiration time
   */
  async refreshAccessToken(userId: string, provider: 'cal_com' | 'calendly'): Promise<{ accessToken: string; expiresAt: Date }> {
    // Get refresh token from database
    const { data: credential } = await supabaseAdmin
      .from('api_credentials')
      .select('api_key, metadata')
      .eq('user_id', userId)
      .eq('service_name', provider === 'cal_com' ? 'cal_com' : 'calendly')
      .single();

    if (!credential) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Calendar credentials not found',
        404
      );
    }

    const refreshToken = (credential.metadata as any)?.refresh_token;
    if (!refreshToken) {
      throw new ApiError(
        ErrorCode.INVALID_CONFIG,
        'Refresh token not available',
        400
      );
    }

    let tokenResponse: Response;
    let tokenData: any;

    if (provider === 'cal_com') {
      const clientId = process.env.CAL_COM_OAUTH_CLIENT_ID;
      const clientSecret = process.env.CAL_COM_OAUTH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new ApiError(
          ErrorCode.INVALID_CONFIG,
          'CAL_COM_OAUTH_CLIENT_ID and CAL_COM_OAUTH_CLIENT_SECRET environment variables are required',
          400
        );
      }

      const baseUrl = process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1';
      tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      });
    } else {
      // Calendly
      const clientId = process.env.CALENDLY_OAUTH_CLIENT_ID;
      const clientSecret = process.env.CALENDLY_OAUTH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new ApiError(
          ErrorCode.INVALID_CONFIG,
          'CALENDLY_OAUTH_CLIENT_ID and CALENDLY_OAUTH_CLIENT_SECRET environment variables are required',
          400
        );
      }

      tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      });
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to refresh token: ${tokenResponse.statusText} - ${errorText}`,
        500
      );
    }

    tokenData = await tokenResponse.json();
    const newAccessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token || refreshToken; // Use new refresh token if provided
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Update tokens in database
    await supabaseAdmin
      .from('users')
      .update({
        calendar_access_token: newAccessToken,
        calendar_refresh_token: newRefreshToken,
        calendar_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId);

    // Update api_credentials table
    await supabaseAdmin
      .from('api_credentials')
      .update({
        api_key: newAccessToken,
        metadata: {
          ...(credential.metadata as any),
          refresh_token: newRefreshToken,
          expires_at: expiresAt.toISOString(),
        },
      })
      .eq('user_id', userId)
      .eq('service_name', provider === 'cal_com' ? 'cal_com' : 'calendly');

    return {
      accessToken: newAccessToken,
      expiresAt,
    };
  }

  /**
   * Get valid access token (refresh if expired)
   * 
   * @param userId - User ID
   * @param provider - Calendar provider
   * @returns Valid access token
   */
  async getValidAccessToken(userId: string, provider: 'cal_com' | 'calendly'): Promise<string> {
    // Check token expiration
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('calendar_access_token, calendar_token_expires_at')
      .eq('id', userId)
      .single();

    if (!user?.calendar_access_token) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Calendar not connected',
        404
      );
    }

    // Check if token is expired
    if (user.calendar_token_expires_at) {
      const expiresAt = new Date(user.calendar_token_expires_at);
      const now = new Date();
      
      // Refresh if expired or expires within 5 minutes
      if (expiresAt <= new Date(now.getTime() + 5 * 60 * 1000)) {
        const refreshed = await this.refreshAccessToken(userId, provider);
        return refreshed.accessToken;
      }
    }

    return user.calendar_access_token;
  }

  /**
   * Verify Cal.com credentials
   */
  async verifyCredentials(credentials: MeetingBookingCredentials): Promise<boolean> {
    try {
      const baseUrl = credentials.base_url || CAL_COM_API_URL;
      const response = await fetch(`${baseUrl}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse Cal.com webhook payload
   */
  parseWebhookPayload(payload: any): {
    event_type: 'booked' | 'cancelled' | 'rescheduled';
    booking_id: string;
    scheduled_time: string;
    prospect_email: string;
    prospect_name?: string;
    metadata?: Record<string, any>;
  } {
    // Cal.com webhook format
    const eventType = payload.type || payload.event_type;
    const booking = payload.booking || payload.data || payload;
    
    const eventMap: Record<string, 'booked' | 'cancelled' | 'rescheduled'> = {
      'BOOKING_CREATED': 'booked',
      'BOOKING_CANCELLED': 'cancelled',
      'BOOKING_RESCHEDULED': 'rescheduled',
    };

    return {
      event_type: eventMap[eventType] || 'booked',
      booking_id: booking.id || booking.uid || booking.bookingUid || '',
      scheduled_time: booking.startTime || booking.start_time || '',
      prospect_email: booking.attendees?.[0]?.email || booking.email || '',
      prospect_name: booking.attendees?.[0]?.name || booking.name || '',
      metadata: booking.metadata || {},
    };
  }
}

// Export singleton instance
export const meetingBookingService = new MeetingBookingService();

