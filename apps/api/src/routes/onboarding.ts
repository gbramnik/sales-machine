import { FastifyInstance } from 'fastify';
import { requireAuth, getUserId } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';
import { z } from 'zod';
import { OnboardingService } from '../services/OnboardingService';
import { createSupabaseClient } from '../lib/supabase';
import * as crypto from 'crypto';

// Validation schemas
const calendarConnectionSchema = z.object({
  provider: z.enum(['cal_com', 'calendly']),
  code: z.string().optional(), // OAuth authorization code
  access_token: z.string().optional(), // Direct token (for API key mode)
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  username: z.string().optional(), // Cal.com username
  default_event_type_id: z.string().optional(),
});

// Validation schemas for onboarding wizard
const goalSelectionSchema = z.object({
  goal: z.enum(['5-10', '10-20', '20-30']),
});

const industrySelectionSchema = z.object({
  industry: z.string().min(1).max(100),
});

const icpConfigSchema = z.object({
  job_titles: z.array(z.string()).optional(),
  company_sizes: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
});

const domainVerificationSchema = z.object({
  domain: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/),
});

const calendarOAuthUrlSchema = z.object({
  provider: z.enum(['google', 'outlook']),
});

const calendarOAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  provider: z.enum(['google', 'outlook']),
});

/**
 * Onboarding API Routes
 * 
 * Handles onboarding wizard steps and calendar connection
 */
export async function onboardingRoutes(server: FastifyInstance) {
  // Initialize OnboardingService
  const onboardingService = new OnboardingService();

  // POST /onboarding/start - Initialize or resume onboarding
  server.post(
    '/start',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        const session = await onboardingService.startOnboarding(userId);
        return reply.send({
          success: true,
          data: session,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to start onboarding',
        });
      }
    }
  );

  // GET /onboarding/status - Get onboarding status and checklist
  server.get(
    '/status',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        const session = await onboardingService.startOnboarding(userId);
        const checklist = await onboardingService.getPreflightChecklist(userId);
        return reply.send({
          success: true,
          data: {
            session,
            checklist,
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to get onboarding status',
        });
      }
    }
  );

  // POST /onboarding/step/goal - Save goal selection
  server.post(
    '/step/goal',
    {
      preHandler: requireAuth,
      schema: {
        body: goalSelectionSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof goalSelectionSchema>;

      try {
        const session = await onboardingService.saveGoalSelection(userId, body.goal);
        return reply.send({
          success: true,
          data: {
            session,
            current_step: 'industry',
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to save goal selection',
        });
      }
    }
  );

  // GET /onboarding/industries - Get list of industries
  server.get(
    '/industries',
    { preHandler: requireAuth },
    async (request, reply) => {
      try {
        const supabase = createSupabaseClient(request.headers.authorization!.substring(7));
        const { data, error } = await supabase
          .from('industry_icp_mappings')
          .select('industry')
          .order('industry');

        if (error) {
          throw new Error(`Failed to fetch industries: ${error.message}`);
        }

        return reply.send({
          success: true,
          data: {
            industries: data?.map((row: any) => row.industry) || [],
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to fetch industries',
        });
      }
    }
  );

  // POST /onboarding/step/industry - Save industry selection
  server.post(
    '/step/industry',
    {
      preHandler: requireAuth,
      schema: {
        body: industrySelectionSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof industrySelectionSchema>;

      try {
        const session = await onboardingService.saveIndustrySelection(userId, body.industry);
        return reply.send({
          success: true,
          data: {
            session,
            current_step: 'icp',
            icp_suggestions: session.icp_config,
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to save industry selection',
        });
      }
    }
  );

  // GET /onboarding/step/icp/suggestions - Get ICP suggestions for industry
  server.get(
    '/step/icp/suggestions',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const industry = (request.query as any)?.industry;

      try {
        let targetIndustry = industry;
        
        // If no industry provided, get from session
        if (!targetIndustry) {
          const session = await onboardingService.startOnboarding(userId);
          targetIndustry = session.industry;
        }

        if (!targetIndustry) {
          return reply.status(400).send({
            success: false,
            error: 'Industry not provided and not found in session',
          });
        }

        const icpConfig = await onboardingService.getAutoSuggestedICP(targetIndustry);
        return reply.send({
          success: true,
          data: icpConfig,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to get ICP suggestions',
        });
      }
    }
  );

  // POST /onboarding/step/icp - Save ICP configuration
  server.post(
    '/step/icp',
    {
      preHandler: requireAuth,
      schema: {
        body: icpConfigSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof icpConfigSchema>;

      try {
        const session = await onboardingService.saveICPConfig(userId, body);
        return reply.send({
          success: true,
          data: {
            session,
            current_step: 'domain',
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to save ICP config',
        });
      }
    }
  );

  // POST /onboarding/step/domain/verify - Verify domain DNS records
  server.post(
    '/step/domain/verify',
    {
      preHandler: requireAuth,
      schema: {
        body: domainVerificationSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof domainVerificationSchema>;

      try {
        const result = await onboardingService.verifyDomain(userId, body.domain);
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to verify domain',
        });
      }
    }
  );

  // GET /onboarding/step/calendar/oauth-url - Get OAuth URL for calendar connection
  server.get(
    '/step/calendar/oauth-url',
    {
      preHandler: requireAuth,
      schema: {
        querystring: calendarOAuthUrlSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const provider = (request.query as any)?.provider;

      if (!provider || (provider !== 'google' && provider !== 'outlook')) {
        return reply.status(400).send({
          success: false,
          error: 'Provider must be "google" or "outlook"',
        });
      }

      try {
        const result = await onboardingService.initiateCalendarOAuth(userId, provider);
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to initiate OAuth',
        });
      }
    }
  );

  // POST /onboarding/step/calendar/callback - Handle OAuth callback
  server.post(
    '/step/calendar/callback',
    {
      preHandler: requireAuth,
      schema: {
        body: calendarOAuthCallbackSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof calendarOAuthCallbackSchema>;

      try {
        const result = await onboardingService.handleCalendarOAuthCallback(
          userId,
          body.code,
          body.state,
          body.provider
        );
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to handle OAuth callback',
        });
      }
    }
  );

  // GET /onboarding/preflight-checklist - Get preflight checklist
  server.get(
    '/preflight-checklist',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        const checklist = await onboardingService.getPreflightChecklist(userId);
        return reply.send({
          success: true,
          data: checklist,
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to get preflight checklist',
        });
      }
    }
  );

  // POST /onboarding/complete - Complete onboarding
  server.post(
    '/complete',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        const session = await onboardingService.completeOnboarding(userId);
        const autoConfig = await onboardingService.applyAutoConfiguration(userId);
        return reply.send({
          success: true,
          data: {
            session,
            auto_config: autoConfig,
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to complete onboarding',
        });
      }
    }
  );

  // GET /onboarding/step/calendar/oauth-initiate - Initiate Cal.com/Calendly OAuth (Story 1.7)
  server.get(
    '/step/calendar/oauth-initiate',
    {
      preHandler: requireAuth,
      schema: {
        querystring: z.object({
          provider: z.enum(['cal_com', 'calendly']),
        }),
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const provider = (request.query as any)?.provider;

      if (!provider || (provider !== 'cal_com' && provider !== 'calendly')) {
        return reply.status(400).send({
          success: false,
          error: 'Provider must be "cal_com" or "calendly"',
        });
      }

      try {
        // Generate state for CSRF protection
        const state = crypto.randomBytes(32).toString('hex');
        const redirectUri = provider === 'cal_com'
          ? (process.env.CAL_COM_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`)
          : (process.env.CALENDLY_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`);

        let oauthUrl: string;

        if (provider === 'cal_com') {
          const clientId = process.env.CAL_COM_OAUTH_CLIENT_ID;
          if (!clientId) {
            return reply.status(400).send({
              success: false,
              error: 'CAL_COM_OAUTH_CLIENT_ID environment variable is required',
            });
          }

          const baseUrl = process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1';
          oauthUrl = `${baseUrl}/oauth/authorize?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent('READ_BOOKINGS,CREATE_BOOKINGS')}` +
            `&state=${state}`;
        } else {
          // Calendly
          const clientId = process.env.CALENDLY_OAUTH_CLIENT_ID;
          if (!clientId) {
            return reply.status(400).send({
              success: false,
              error: 'CALENDLY_OAUTH_CLIENT_ID environment variable is required',
            });
          }

          oauthUrl = `https://auth.calendly.com/oauth/authorize?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent('meeting:read meeting:write')}` +
            `&state=${state}`;
        }

        // Store state in session for verification (using onboarding session if exists)
        const { data: session } = await supabaseAdmin
          .from('onboarding_sessions')
          .select('id, metadata')
          .eq('user_id', userId)
          .single();

        if (session) {
          await supabaseAdmin
            .from('onboarding_sessions')
            .update({
              metadata: { ...(session.metadata || {}), oauth_state: state, oauth_provider: provider },
            })
            .eq('id', session.id);
        }

        return reply.send({
          success: true,
          data: {
            oauth_url: oauthUrl,
            state,
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to initiate OAuth',
        });
      }
    }
  );

  // GET /auth/calendar/callback - OAuth callback handler (Story 1.7)
  server.get(
    '/auth/calendar/callback',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const { code, state, provider } = request.query as { code?: string; state?: string; provider?: string };

      if (!code || !state) {
        return reply.status(400).send({
          success: false,
          error: 'Missing code or state parameter',
        });
      }

      try {
        // Verify state from session
        const { data: session } = await supabaseAdmin
          .from('onboarding_sessions')
          .select('metadata')
          .eq('user_id', userId)
          .single();

        const storedState = (session?.metadata as any)?.oauth_state;
        const storedProvider = (session?.metadata as any)?.oauth_provider || provider;

        if (storedState !== state) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid OAuth state - possible CSRF attack',
          });
        }

        if (!storedProvider || (storedProvider !== 'cal_com' && storedProvider !== 'calendly')) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid or missing provider',
          });
        }

        // Exchange code for tokens (reuse logic from POST /step/calendar)
        const baseUrl = storedProvider === 'cal_com' 
          ? (process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1')
          : 'https://api.calendly.com';
        
        let tokenResponse: Response;
        let tokenData: any;

        if (storedProvider === 'cal_com') {
          const clientId = process.env.CAL_COM_OAUTH_CLIENT_ID;
          const clientSecret = process.env.CAL_COM_OAUTH_CLIENT_SECRET;
          const redirectUri = process.env.CAL_COM_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`;

          if (!clientId || !clientSecret) {
            throw new Error('CAL_COM_OAUTH_CLIENT_ID and CAL_COM_OAUTH_CLIENT_SECRET environment variables are required');
          }

          tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });
        } else {
          const clientId = process.env.CALENDLY_OAUTH_CLIENT_ID;
          const clientSecret = process.env.CALENDLY_OAUTH_CLIENT_SECRET;
          const redirectUri = process.env.CALENDLY_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`;

          if (!clientId || !clientSecret) {
            throw new Error('CALENDLY_OAUTH_CLIENT_ID and CALENDLY_OAUTH_CLIENT_SECRET environment variables are required');
          }

          tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });
        }

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Failed to exchange OAuth code: ${tokenResponse.statusText} - ${errorText}`);
        }

        tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresAt = tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null;

        // Store tokens (same logic as POST /step/calendar)
        await supabaseAdmin
          .from('users')
          .update({
            calendar_provider: storedProvider,
            calendar_access_token: accessToken,
            calendar_refresh_token: refreshToken,
            calendar_token_expires_at: expiresAt?.toISOString() || null,
          })
          .eq('id', userId);

        // Also store in api_credentials table
        const serviceName = storedProvider === 'cal_com' ? 'cal_com' : 'calendly';
        await supabaseAdmin
          .from('api_credentials')
          .upsert({
            user_id: userId,
            service_name: serviceName,
            api_key: accessToken,
            metadata: {
              refresh_token: refreshToken,
              expires_at: expiresAt?.toISOString(),
              base_url: storedProvider === 'cal_com' ? (process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1') : undefined,
            },
            is_active: true,
          }, {
            onConflict: 'user_id,service_name',
          });

        // Redirect to frontend success page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return reply.redirect(`${frontendUrl}/onboarding?calendar_connected=true`);
      } catch (error: any) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return reply.redirect(`${frontendUrl}/onboarding?error=${encodeURIComponent(error.message || 'Failed to connect calendar')}`);
      }
    }
  );

  // Existing calendar routes (from Story 1.7)
  // Connect calendar during onboarding (Story 1.7 - Task 2)
  server.post(
    '/step/calendar',
    {
      preHandler: requireAuth,
      schema: {
        body: calendarConnectionSchema,
      },
    },
    async (request, reply) => {
      const userId = getUserId(request);
      const body = request.body as z.infer<typeof calendarConnectionSchema>;

      try {
        // If OAuth code provided, exchange for tokens
        let accessToken = body.access_token;
        let refreshToken = body.refresh_token;
        let expiresAt: Date | null = null;

        if (body.code && !accessToken) {
          // Exchange OAuth code for tokens
          const baseUrl = body.provider === 'cal_com' 
            ? (process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1')
            : 'https://api.calendly.com';
          
          let tokenResponse: Response;
          let tokenData: any;

          if (body.provider === 'cal_com') {
            // Cal.com OAuth token exchange
            const clientId = process.env.CAL_COM_OAUTH_CLIENT_ID;
            const clientSecret = process.env.CAL_COM_OAUTH_CLIENT_SECRET;
            const redirectUri = process.env.CAL_COM_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`;

            if (!clientId || !clientSecret) {
              throw new ApiError(
                ErrorCode.INVALID_REQUEST,
                'CAL_COM_OAUTH_CLIENT_ID and CAL_COM_OAUTH_CLIENT_SECRET environment variables are required for OAuth',
                400
              );
            }

            tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                code: body.code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
              }),
            });
          } else {
            // Calendly OAuth token exchange
            const clientId = process.env.CALENDLY_OAUTH_CLIENT_ID;
            const clientSecret = process.env.CALENDLY_OAUTH_CLIENT_SECRET;
            const redirectUri = process.env.CALENDLY_OAUTH_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/callback`;

            if (!clientId || !clientSecret) {
              throw new ApiError(
                ErrorCode.INVALID_REQUEST,
                'CALENDLY_OAUTH_CLIENT_ID and CALENDLY_OAUTH_CLIENT_SECRET environment variables are required for OAuth',
                400
              );
            }

            tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                code: body.code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
              }),
            });
          }

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new ApiError(
              ErrorCode.INTERNAL_SERVER_ERROR,
              `Failed to exchange OAuth code: ${tokenResponse.statusText} - ${errorText}`,
              500
            );
          }

          tokenData = await tokenResponse.json();
          accessToken = tokenData.access_token;
          refreshToken = tokenData.refresh_token;
          
          if (tokenData.expires_in) {
            expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
          }
        }

        if (body.expires_in) {
          expiresAt = new Date(Date.now() + body.expires_in * 1000);
        }

        // Store calendar credentials in users table
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            calendar_provider: body.provider,
            calendar_access_token: accessToken || null,
            calendar_refresh_token: refreshToken || null,
            calendar_token_expires_at: expiresAt?.toISOString() || null,
            calendar_username: body.username || null,
            default_event_type_id: body.default_event_type_id || null,
          })
          .eq('id', userId);

        if (updateError) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Failed to save calendar credentials',
            500,
            updateError
          );
        }

        // Also store in api_credentials table for consistency
        if (accessToken) {
          const serviceName = body.provider === 'cal_com' ? 'cal_com' : 'calendly';
          await supabaseAdmin
            .from('api_credentials')
            .upsert({
              user_id: userId,
              service_name: serviceName,
              api_key: accessToken,
              metadata: {
                username: body.username,
                default_event_type_id: body.default_event_type_id,
                refresh_token: refreshToken,
                expires_at: expiresAt?.toISOString(),
                base_url: body.provider === 'cal_com' ? (process.env.CAL_COM_BASE_URL || 'https://api.cal.com/v1') : undefined,
              },
              is_active: true,
            }, {
              onConflict: 'user_id,service_name',
            });
        }

        return reply.send({
          success: true,
          message: 'Calendar connected successfully',
        });
      } catch (error: any) {
        if (error instanceof ApiError) {
          return reply.status(error.statusCode).send({
            success: false,
            error: error.message,
            code: error.code,
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to connect calendar',
          details: error.message,
        });
      }
    }
  );

  // Get calendar connection status
  server.get(
    '/step/calendar',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);

      try {
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('calendar_provider, calendar_username, default_event_type_id')
          .eq('id', userId)
          .single();

        if (error || !user) {
          throw new ApiError(
            ErrorCode.NOT_FOUND,
            'User not found',
            404
          );
        }

        return reply.send({
          success: true,
          data: {
            connected: !!user.calendar_provider,
            provider: user.calendar_provider,
            username: user.calendar_username,
            default_event_type_id: user.default_event_type_id,
          },
        });
      } catch (error: any) {
        if (error instanceof ApiError) {
          return reply.status(error.statusCode).send({
            success: false,
            error: error.message,
            code: error.code,
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch calendar status',
          details: error.message,
        });
      }
    }
  );
}

