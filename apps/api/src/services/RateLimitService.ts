import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
const redis = process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    })
  : null;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}

export class RateLimitService {
  private readonly DAILY_LIMIT = 100;
  private readonly TTL_SECONDS = 24 * 60 * 60; // 24 hours

  /**
   * Check if user has exceeded daily scraping limit
   * @param userId User ID
   * @returns Rate limit result
   */
  async checkScrapingLimit(userId: string): Promise<RateLimitResult> {
    if (!redis) {
      // If Redis not configured, allow request (development mode)
      console.warn('Redis not configured, skipping rate limit check');
      return {
        allowed: true,
        remaining: this.DAILY_LIMIT,
        limit: this.DAILY_LIMIT,
        resetAt: new Date(Date.now() + this.TTL_SECONDS * 1000),
      };
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `scraping_limit:${userId}:${today}`;

    try {
      // Get current count
      const count = await redis.get<number>(key) || 0;

      // Check if limit exceeded
      if (count >= this.DAILY_LIMIT) {
        const resetAt = new Date();
        resetAt.setHours(24, 0, 0, 0); // Reset at midnight

        return {
          allowed: false,
          remaining: 0,
          limit: this.DAILY_LIMIT,
          resetAt,
        };
      }

      // Increment counter
      const newCount = await redis.incr(key);

      // Set TTL if this is the first increment today
      if (newCount === 1) {
        await redis.expire(key, this.TTL_SECONDS);
      }

      const resetAt = new Date();
      resetAt.setHours(24, 0, 0, 0);

      return {
        allowed: true,
        remaining: this.DAILY_LIMIT - newCount,
        limit: this.DAILY_LIMIT,
        resetAt,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // On error, allow request (fail open for availability)
      return {
        allowed: true,
        remaining: this.DAILY_LIMIT,
        limit: this.DAILY_LIMIT,
        resetAt: new Date(Date.now() + this.TTL_SECONDS * 1000),
      };
    }
  }

  /**
   * Get current scraping count for user
   * @param userId User ID
   * @returns Current count and limit info
   */
  async getScrapingCount(userId: string): Promise<{ count: number; limit: number; resetAt: Date }> {
    if (!redis) {
      return {
        count: 0,
        limit: this.DAILY_LIMIT,
        resetAt: new Date(Date.now() + this.TTL_SECONDS * 1000),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const key = `scraping_limit:${userId}:${today}`;

    try {
      const count = await redis.get<number>(key) || 0;
      const resetAt = new Date();
      resetAt.setHours(24, 0, 0, 0);

      return {
        count,
        limit: this.DAILY_LIMIT,
        resetAt,
      };
    } catch (error) {
      console.error('Failed to get scraping count:', error);
      return {
        count: 0,
        limit: this.DAILY_LIMIT,
        resetAt: new Date(Date.now() + this.TTL_SECONDS * 1000),
      };
    }
  }
}


