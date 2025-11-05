import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
}

/**
 * Admin Supabase client with service role key
 * Use this for server-side operations that bypass RLS
 * WARNING: Never expose this to the frontend
 */
export const supabaseAdmin = createClient(
  supabaseUrl!,
  supabaseServiceKey || supabaseAnonKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create a Supabase client for a specific user
 * This respects RLS policies based on the JWT token
 */
export function createSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verify JWT token and extract user info
 */
export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Helper function to check if user exists in users table
 */
export async function ensureUserExists(userId: string, email: string, fullName?: string): Promise<void> {
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingUser) {
    // Create user profile if it doesn't exist
    // @ts-ignore - Supabase type inference issue with Database generic
    await supabaseAdmin.from('users').insert({
      id: userId,
      email,
      full_name: fullName,
    });
  }
}

// Export default client (using admin for now, will be user-scoped in routes)
export { supabaseAdmin as supabase };
