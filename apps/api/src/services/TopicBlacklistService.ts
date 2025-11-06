import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';

/**
 * Topic Blacklist Service
 * 
 * Manages blacklisted phrases for sensitive topics (pricing, guarantees, competitors, unverified claims).
 * Supports system-wide defaults (user_id = NULL) and user-specific customizations.
 */
export class TopicBlacklistService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get blacklist phrases for a user (merges system defaults + user-specific)
   * @param userId - The user ID
   * @param category - Optional category filter
   * @returns Array of blacklist phrases
   */
  async getBlacklist(
    userId: string,
    category?: 'pricing' | 'guarantee' | 'competitor' | 'unverified_claim'
  ): Promise<Array<{
    id: string;
    category: string;
    phrase: string;
    regex_pattern: string | null;
    severity: 'block' | 'warning' | 'review';
  }>> {
    // Get system-wide defaults (user_id IS NULL)
    let systemQuery = this.supabase
      .from('topic_blacklist')
      .select('id, topic_category, blacklisted_phrase, regex_pattern, severity')
      .is('user_id', null)
      .eq('is_active', true);

    if (category) {
      systemQuery = systemQuery.eq('topic_category', category);
    }

    const { data: systemPhrases, error: systemError } = await systemQuery;

    if (systemError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch system blacklist',
        500,
        systemError
      );
    }

    // Get user-specific phrases
    let userQuery = this.supabase
      .from('topic_blacklist')
      .select('id, topic_category, blacklisted_phrase, regex_pattern, severity')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (category) {
      userQuery = userQuery.eq('topic_category', category);
    }

    const { data: userPhrases, error: userError } = await userQuery;

    if (userError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch user blacklist',
        500,
        userError
      );
    }

    // Merge: user-specific phrases override system defaults (by phrase text)
    const systemMap = new Map(
      (systemPhrases || []).map(p => [p.blacklisted_phrase.toLowerCase(), p])
    );
    const userMap = new Map(
      (userPhrases || []).map(p => [p.blacklisted_phrase.toLowerCase(), p])
    );

    // User phrases take precedence
    const merged = Array.from(userMap.values());
    
    // Add system phrases that aren't overridden by user
    for (const [phrase, phraseData] of systemMap.entries()) {
      if (!userMap.has(phrase)) {
        merged.push(phraseData);
      }
    }

    return merged.map(p => ({
      id: p.id,
      category: p.topic_category,
      phrase: p.blacklisted_phrase,
      regex_pattern: p.regex_pattern,
      severity: p.severity as 'block' | 'warning' | 'review',
    }));
  }

  /**
   * Add a user-specific blacklist phrase
   * @param userId - The user ID
   * @param category - The topic category
   * @param phrase - The phrase to blacklist
   * @param severity - The severity level (default: 'block')
   * @returns The created phrase
   */
  async addBlacklistPhrase(
    userId: string,
    category: 'pricing' | 'guarantee' | 'competitor' | 'unverified_claim',
    phrase: string,
    severity: 'block' | 'warning' | 'review' = 'block'
  ): Promise<{
    id: string;
    category: string;
    phrase: string;
    severity: string;
  }> {
    const { data, error } = await this.supabase
      .from('topic_blacklist')
      .insert({
        user_id: userId,
        topic_category: category,
        blacklisted_phrase: phrase,
        severity,
        is_active: true,
      })
      .select('id, topic_category, blacklisted_phrase, severity')
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          'This phrase is already in your blacklist',
          400,
          error
        );
      }
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to add blacklist phrase',
        500,
        error
      );
    }

    return {
      id: data.id,
      category: data.topic_category,
      phrase: data.blacklisted_phrase,
      severity: data.severity,
    };
  }

  /**
   * Remove a user-specific blacklist phrase
   * @param userId - The user ID
   * @param phraseId - The phrase ID to remove
   */
  async removeBlacklistPhrase(
    userId: string,
    phraseId: string
  ): Promise<void> {
    // Verify phrase belongs to user (can't delete system phrases)
    const { data: phrase, error: fetchError } = await this.supabase
      .from('topic_blacklist')
      .select('id, user_id')
      .eq('id', phraseId)
      .single();

    if (fetchError || !phrase) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Blacklist phrase not found',
        404,
        fetchError
      );
    }

    if (phrase.user_id !== userId) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'You can only remove your own blacklist phrases',
        403
      );
    }

    // Delete the phrase
    const { error: deleteError } = await this.supabase
      .from('topic_blacklist')
      .delete()
      .eq('id', phraseId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to remove blacklist phrase',
        500,
        deleteError
      );
    }
  }
}

