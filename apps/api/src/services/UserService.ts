import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';
import { supabaseAdmin } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
  constructor(private supabase: typeof supabaseAdmin) {}

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'User not found',
        404
      );
    }

    return data;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    // @ts-ignore - Supabase type inference issue with Database generic
    const { data, error } = await this.supabase
      .from('users')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to update user',
        500,
        error
      );
    }

    return data;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    // @ts-ignore - Supabase type inference issue with Database generic
    await this.supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() } as any)
      .eq('id', userId);
  }
}
