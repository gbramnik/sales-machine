import { supabase } from '../lib/supabase';
import { ApiError, ErrorCode } from '../types';

/**
 * Confidence Service
 * 
 * Handles confidence threshold checking for AI-generated messages.
 * Manages user-specific confidence thresholds (default 80%, range 60-95%).
 */

export class ConfidenceService {
  /**
   * Get confidence threshold for a user
   * 
   * @param userId - User ID
   * @returns Confidence threshold (60-95, default 80)
   */
  async getConfidenceThreshold(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('users')
      .select('ai_confidence_threshold')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to get confidence threshold: ${error.message}`,
        500,
        error
      );
    }

    // Return user threshold or default 80
    const threshold = data?.ai_confidence_threshold;
    if (threshold === null || threshold === undefined) {
      return 80; // Default threshold
    }

    // Validate threshold is in valid range (60-95)
    if (threshold < 60 || threshold > 95) {
      return 80; // Default if invalid
    }

    return threshold;
  }

  /**
   * Check if message should be queued for review based on confidence score
   * 
   * @param confidenceScore - Confidence score (0-100)
   * @param userId - User ID
   * @returns true if should queue for review (score < threshold), false otherwise
   */
  async shouldQueueForReview(confidenceScore: number, userId: string): Promise<boolean> {
    const threshold = await this.getConfidenceThreshold(userId);
    return confidenceScore < threshold;
  }
}



