import { Redis } from '@upstash/redis';
import { ApiError, ErrorCode } from '../types';

/**
 * Email Sending Limit Service
 * 
 * Enforces hard-coded sending limit: Maximum 20 emails/day per sending address.
 * Non-bypassable code enforcement per FR6.
 * 
 * Uses Upstash Redis to track daily count:
 * Key: `email_sent:{user_id}:{sending_email}:{YYYY-MM-DD}`
 * Value: Count (integer)
 * TTL: 24 hours
 */

const MAX_DAILY_LIMIT = 20; // Hard-coded limit per FR6

export class EmailSendingLimitService {
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
   * Get Redis key for daily sending count
   */
  private getDailyKey(userId: string, sendingEmail: string, date: string): string {
    return `email_sent:${userId}:${sendingEmail}:${date}`;
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Check if daily sending limit has been reached
   * 
   * @param userId - User ID
   * @param sendingEmail - Sending email address
   * @returns true if limit reached, false otherwise
   */
  async isLimitReached(userId: string, sendingEmail: string): Promise<boolean> {
    const today = this.getTodayDate();
    const key = this.getDailyKey(userId, sendingEmail, today);

    const count = await this.redis.get<number>(key) || 0;
    return count >= MAX_DAILY_LIMIT;
  }

  /**
   * Get current daily sending count
   * 
   * @param userId - User ID
   * @param sendingEmail - Sending email address
   * @returns Current count for today
   */
  async getDailyCount(userId: string, sendingEmail: string): Promise<number> {
    const today = this.getTodayDate();
    const key = this.getDailyKey(userId, sendingEmail, today);

    const count = await this.redis.get<number>(key) || 0;
    return count;
  }

  /**
   * Increment daily sending count
   * 
   * @param userId - User ID
   * @param sendingEmail - Sending email address
   * @returns New count after increment
   */
  async incrementCount(userId: string, sendingEmail: string): Promise<number> {
    const today = this.getTodayDate();
    const key = this.getDailyKey(userId, sendingEmail, today);

    // Increment and set TTL to 24 hours (86400 seconds)
    const newCount = await this.redis.incr(key);
    await this.redis.expire(key, 86400); // 24 hours TTL

    return newCount;
  }

  /**
   * Validate that daily limit has not been reached
   * 
   * @param userId - User ID
   * @param sendingEmail - Sending email address
   * @throws ApiError if limit reached
   */
  async validateLimit(userId: string, sendingEmail: string): Promise<void> {
    const isReached = await this.isLimitReached(userId, sendingEmail);

    if (isReached) {
      const count = await this.getDailyCount(userId, sendingEmail);
      throw new ApiError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        `Daily sending limit reached (${count}/${MAX_DAILY_LIMIT} emails/day). Limit resets in 24 hours.`,
        429
      );
    }
  }

  /**
   * Get remaining emails for today
   * 
   * @param userId - User ID
   * @param sendingEmail - Sending email address
   * @returns Remaining count
   */
  async getRemainingCount(userId: string, sendingEmail: string): Promise<number> {
    const count = await this.getDailyCount(userId, sendingEmail);
    return Math.max(0, MAX_DAILY_LIMIT - count);
  }
}

// Export singleton instance
export const emailSendingLimitService = new EmailSendingLimitService();

