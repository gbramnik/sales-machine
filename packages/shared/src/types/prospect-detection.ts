/**
 * Prospect Detection Types
 * 
 * Types for Story 1.10: Daily Prospect Detection & Filtering
 */

export type DetectionMode = 'autopilot' | 'semi_auto';

export interface DetectionSettings {
  detection_mode: DetectionMode;
  daily_prospect_count: number; // 1-40
  detection_time: string; // HH:MM format
}

export interface ProspectValidationQueueItem {
  id: string;
  prospect_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  validated_at: string | null;
  validated_by: string | null;
  prospect?: {
    id: string;
    full_name: string;
    company_name: string;
    job_title: string | null;
    linkedin_url: string | null;
    location: string | null;
    profile_summary: string | null;
  };
}

export interface ExclusionResult {
  excluded_urls: string[];
  count: number;
}

export interface DailyDetectionResult {
  user_id: string;
  detection_mode: DetectionMode;
  prospects_detected: number;
  prospects_added: number;
  execution_time: string;
}





