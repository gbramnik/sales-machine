import { Redis } from '@upstash/redis';
import { supabase } from '../lib/supabase';

/**
 * Exclusion Service
 * 
 * Handles exclusion logic for prospect detection:
 * - Excludes prospects already contacted
 * - Excludes prospects in warm-up schedule
 * - Excludes prospects with connection requests
 * 
 * Uses Redis caching for performance (24h TTL)
 */

export class ExclusionService {
  private redis: Redis;

  constructor() {
    const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      throw new Error('Upstash Redis credentials not configured');
    }

    this.redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  /**
   * Get Redis cache key for excluded prospects
   */
  private getCacheKey(userId: string, date: string): string {
    return `excluded_prospects:${userId}:${date}`;
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get all excluded LinkedIn URLs for a user
   * 
   * @param userId - User ID
   * @returns Array of LinkedIn URLs to exclude
   */
  async getExcludedProspectUrls(userId: string): Promise<string[]> {
    const today = this.getTodayDate();
    const cacheKey = this.getCacheKey(userId, today);

    // Check cache first
    try {
      const cached = await this.redis.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.error('Redis cache error:', error);
      // Continue to database query if cache fails
    }

    // Query database
    const excludedUrls: string[] = [];

    // 1. Get contacted prospects
    const { data: contactedProspects } = await supabase
      .from('prospects')
      .select('linkedin_url')
      .eq('user_id', userId)
      .in('status', ['contacted', 'engaged', 'qualified', 'booked', 'meeting_booked'])
      .not('linkedin_url', 'is', null);

    if (contactedProspects) {
      excludedUrls.push(
        ...contactedProspects
          .map(p => p.linkedin_url)
          .filter((url): url is string => url !== null)
      );
    }

    // 2. Get prospects in warm-up schedule
    const { data: warmupProspects } = await supabase
      .from('linkedin_warmup_schedule')
      .select('prospects(linkedin_url)')
      .eq('user_id', userId);

    if (warmupProspects) {
      excludedUrls.push(
        ...warmupProspects
          .map((item: any) => item.prospects?.linkedin_url)
          .filter((url): url is string => url !== null && url !== undefined)
      );
    }

    // 3. Get prospects with connection requests (if linkedin_connections table exists)
    // Note: This table may not exist yet, so we'll check gracefully
    try {
      const { data: connectionProspects } = await supabase
        .from('linkedin_connections')
        .select('prospects(linkedin_url)')
        .eq('user_id', userId);

      if (connectionProspects) {
        excludedUrls.push(
          ...connectionProspects
            .map((item: any) => item.prospects?.linkedin_url)
            .filter((url): url is string => url !== null && url !== undefined)
        );
      }
    } catch (error) {
      // Table doesn't exist, skip this exclusion
      console.log('linkedin_connections table not found, skipping connection exclusion');
    }

    // Remove duplicates
    const uniqueUrls = [...new Set(excludedUrls)];

    // Cache result for 24 hours
    try {
      await this.redis.set(cacheKey, uniqueUrls, { ex: 86400 });
    } catch (error) {
      console.error('Redis cache set error:', error);
    }

    return uniqueUrls;
  }

  /**
   * Check if a LinkedIn URL is excluded
   * 
   * @param userId - User ID
   * @param linkedinUrl - LinkedIn URL to check
   * @returns true if excluded, false otherwise
   */
  async isExcluded(userId: string, linkedinUrl: string): Promise<boolean> {
    const excludedUrls = await this.getExcludedProspectUrls(userId);
    return excludedUrls.includes(linkedinUrl);
  }

  /**
   * Clear exclusion cache for a user (useful for testing or manual refresh)
   * 
   * @param userId - User ID
   */
  async clearCache(userId: string): Promise<void> {
    const today = this.getTodayDate();
    const cacheKey = this.getCacheKey(userId, today);
    
    try {
      await this.redis.del(cacheKey);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }
}

