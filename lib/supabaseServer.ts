import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Initializes a Supabase client for Server Components, Route Handlers, and Server Actions.
 * Supports SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://msrhvfkdptfghslfxoqv.supabase.co';

  const supabaseKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'sb_publishable_dLW4P7RhNKJUOJvjMVvxfw_57quyFBH';

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  });
}
