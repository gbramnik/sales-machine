/**
 * Confidence Scoring Types
 * 
 * Types for Story 2.1: AI Confidence Scoring System
 */

export type ConfidenceScore = number; // 0-100

export interface ConfidenceReasoning {
  context_completeness: number; // 0-40
  fact_verifiability: number; // 0-40
  tone_appropriateness: number; // 0-20
  reasoning: string;
}

export interface ConfidenceDistribution {
  '0-20': number;
  '21-40': number;
  '41-60': number;
  '61-80': number;
  '81-100': number;
}

export interface ReviewMetrics {
  total_messages: number;
  queued_messages: number;
  approved_messages: number;
  percentage_requiring_review: number;
  review_to_send_conversion_rate: number;
}

export interface ConfidenceAnalytics {
  distribution: ConfidenceDistribution;
  review_metrics: ReviewMetrics;
  average_confidence: number;
}

