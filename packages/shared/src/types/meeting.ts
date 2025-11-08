import { z } from 'zod';
import type { Database } from './database.types';

export type MeetingRow = Database['public']['Tables']['meetings']['Row'];
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert'];
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update'];

export const MeetingTypeSchema = z.enum(['discovery', 'demo', 'follow_up', 'closing', 'other']);
export const MeetingStatusSchema = z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled']);
export const CalendarProviderSchema = z.enum(['cal_com', 'calendly', 'google', 'other']);

export const MeetingSchema = z.object({
  id: z.string().uuid(),
  prospect_id: z.string().uuid(),
  user_id: z.string().uuid(),
  campaign_id: z.string().uuid().nullable(),
  title: z.string().min(1, 'Meeting title is required'),
  description: z.string().nullable(),
  meeting_type: MeetingTypeSchema.default('discovery'),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(480).default(30),
  timezone: z.string().default('UTC'),
  calendar_event_id: z.string().nullable(),
  calendar_provider: CalendarProviderSchema.nullable(),
  meeting_link: z.string().url().nullable(),
  status: MeetingStatusSchema.default('scheduled'),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string(),
  })).default([]),
  pre_meeting_notes: z.string().nullable(),
  post_meeting_notes: z.string().nullable(),
  outcome: z.string().nullable(),
  next_steps: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  cancelled_at: z.string().datetime().nullable(),
  cancellation_reason: z.string().nullable(),
});

export type Meeting = z.infer<typeof MeetingSchema>;

export const CreateMeetingSchema = MeetingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateMeetingSchema = MeetingSchema.partial().omit({
  id: true,
  prospect_id: true,
  user_id: true,
  created_at: true,
});

export const GenerateBookingLinkRequestSchema = z.object({
  prospect_id: z.string().uuid(),
  event_type_id: z.string().optional(),
  duration: z.number().int().min(15).max(120).optional(),
});

export type GenerateBookingLinkRequest = z.infer<typeof GenerateBookingLinkRequestSchema>;

export const GenerateBookingLinkResponseSchema = z.object({
  booking_link: z.string().url(),
  booking_id: z.string(),
  scheduled_at: z.string().datetime().optional(),
});

export type GenerateBookingLinkResponse = z.infer<typeof GenerateBookingLinkResponseSchema>;

export interface MeetingWithProspect extends Meeting {
  prospect: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    job_title: string | null;
    linkedin_url: string | null;
    profile_summary: string | null;
  };
  enrichment?: {
    talking_points: string[] | null;
    pain_points: string[] | null;
    company_insights: string | null;
  };
}





