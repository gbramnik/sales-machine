import { Redis } from '@upstash/redis';

/**
 * Email Queue Service
 * 
 * Manages email queue in Upstash Redis using sorted sets.
 * Priority: VIP accounts first (score = timestamp + priority_boost)
 * 
 * Redis Key: `email_queue:{user_id}`
 * Score: timestamp + (is_vip ? 1000000 : 0)
 * Member: JSON payload with email data
 */

const VIP_PRIORITY_BOOST = 1000000; // VIP emails processed first

export interface EmailQueueItem {
  prospect_id: string;
  template_id: string;
  sending_email: string;
  personalized_subject: string;
  personalized_body: string;
  is_vip?: boolean;
  user_id: string;
  campaign_id?: string;
}

export interface QueuedEmail extends EmailQueueItem {
  queue_position: number;
  queued_at: string;
}

export class EmailQueueService {
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
   * Get Redis key for user's email queue
   */
  private getQueueKey(userId: string): string {
    return `email_queue:${userId}`;
  }

  /**
   * Calculate score for queue item (VIP priority)
   */
  private calculateScore(isVip: boolean): number {
    const timestamp = Date.now();
    const priorityBoost = isVip ? VIP_PRIORITY_BOOST : 0;
    return timestamp - priorityBoost; // Lower score = higher priority (VIP first)
  }

  /**
   * Enqueue email to Redis sorted set
   * 
   * @param item - Email queue item
   * @returns Queue position (0-based)
   */
  async enqueue(item: EmailQueueItem): Promise<number> {
    const key = this.getQueueKey(item.user_id);
    const score = this.calculateScore(item.is_vip || false);
    const member = JSON.stringify(item);

    // Add to sorted set (lower score = higher priority)
    await this.redis.zadd(key, { score, member });

    // Get queue position (rank in sorted set, 0 = next to process)
    const position = await this.redis.zrank(key, member) || 0;

    return position;
  }

  /**
   * Dequeue up to N emails from queue (highest priority first)
   * 
   * @param userId - User ID
   * @param limit - Maximum number of emails to dequeue (default: 20)
   * @returns Array of queued emails
   */
  async dequeue(userId: string, limit: number = 20): Promise<QueuedEmail[]> {
    const key = this.getQueueKey(userId);

    // Get top N items from sorted set (lowest scores first = VIP first)
    const items = await this.redis.zrange<string[]>(key, 0, limit - 1, { withScores: false });

    if (!items || items.length === 0) {
      return [];
    }

    // Parse and remove from queue
    const queuedEmails: QueuedEmail[] = [];

    for (const itemJson of items) {
      try {
        const item: EmailQueueItem = JSON.parse(itemJson);
        const position = await this.redis.zrank(key, itemJson) || 0;

        queuedEmails.push({
          ...item,
          queue_position: position,
          queued_at: new Date().toISOString(),
        });

        // Remove from queue
        await this.redis.zrem(key, itemJson);
      } catch (error) {
        console.error('Failed to parse queue item:', error);
        // Remove invalid item
        await this.redis.zrem(key, itemJson);
      }
    }

    return queuedEmails;
  }

  /**
   * Get queue size for user
   * 
   * @param userId - User ID
   * @returns Number of emails in queue
   */
  async getQueueSize(userId: string): Promise<number> {
    const key = this.getQueueKey(userId);
    return await this.redis.zcard(key) || 0;
  }

  /**
   * Get queue position for a specific email
   * 
   * @param userId - User ID
   * @param prospectId - Prospect ID
   * @returns Queue position or null if not found
   */
  async getQueuePosition(userId: string, prospectId: string): Promise<number | null> {
    const key = this.getQueueKey(userId);

    // Get all items and find prospect_id
    const items = await this.redis.zrange<string[]>(key, 0, -1, { withScores: false });

    for (let i = 0; i < items.length; i++) {
      try {
        const item: EmailQueueItem = JSON.parse(items[i]);
        if (item.prospect_id === prospectId) {
          return i;
        }
      } catch (error) {
        // Skip invalid items
      }
    }

    return null;
  }

  /**
   * Remove email from queue (e.g., if sending failed and should be retried later)
   * 
   * @param userId - User ID
   * @param prospectId - Prospect ID
   */
  async removeFromQueue(userId: string, prospectId: string): Promise<void> {
    const key = this.getQueueKey(userId);

    // Find and remove item
    const items = await this.redis.zrange<string[]>(key, 0, -1, { withScores: false });

    for (const itemJson of items) {
      try {
        const item: EmailQueueItem = JSON.parse(itemJson);
        if (item.prospect_id === prospectId) {
          await this.redis.zrem(key, itemJson);
          return;
        }
      } catch (error) {
        // Skip invalid items
      }
    }
  }

  /**
   * Clear entire queue for user (use with caution)
   * 
   * @param userId - User ID
   */
  async clearQueue(userId: string): Promise<void> {
    const key = this.getQueueKey(userId);
    await this.redis.del(key);
  }
}

// Export singleton instance
export const emailQueueService = new EmailQueueService();

