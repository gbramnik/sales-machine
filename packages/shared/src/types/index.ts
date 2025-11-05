// Type exports - will be populated as features are developed
export type { Database } from './database';

// Meeting types
export type {
  Meeting,
  MeetingRow,
  MeetingInsert,
  MeetingUpdate,
  MeetingWithProspect,
  GenerateBookingLinkRequest,
  GenerateBookingLinkResponse,
} from './meeting';

export {
  MeetingSchema,
  MeetingTypeSchema,
  MeetingStatusSchema,
  CalendarProviderSchema,
  CreateMeetingSchema,
  UpdateMeetingSchema,
  GenerateBookingLinkRequestSchema,
  GenerateBookingLinkResponseSchema,
} from './meeting';

// Warmup types
export type {
  WarmupScheduleRow,
  WarmupActionRow,
  WarmupScheduleInsert,
  WarmupActionInsert,
  WarmupScheduleUpdate,
  WarmupActionUpdate,
  WarmupConfig,
  WarmupStatus,
  StartWarmupResult,
  WarmupAction,
  WarmupScheduleWithProspect,
  WarmupScheduleStatus,
  WarmupActionType,
} from './warmup';

// Scraping types
export type {
  Prospect,
  ProspectInsert,
  ProspectUpdate,
  ProspectEnrichment,
  ProspectEnrichmentInsert,
  ProspectEnrichmentUpdate,
  CompanyData,
  ScrapingParams,
  ScrapingResponse,
  ProspectValidationResult,
  ValidatedProspect,
  RejectedProspect,
  ScrapingExecutionMetrics,
  ScrapingRateLimitInfo,
} from './scraping';
