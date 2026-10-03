import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing in environment variables.');
}

// Client for general public/server operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Admin client for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper to create an authenticated Supabase client for a specific user token (respecting RLS)
export const createScopedClient = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

// Cached public reader token
let publicReadToken = null;
let publicReadTokenExp = 0;

/**
 * Provides an authenticated client for public read-only requests when no user is logged in
 */
export const getPublicReadClient = async () => {
  try {
    const now = Math.floor(Date.now() / 1000);
    if (publicReadToken && publicReadTokenExp > now + 60) {
      return createScopedClient(publicReadToken);
    }

    // Attempt sign in with system reader account
    let { data, error } = await supabase.auth.signInWithPassword({
      email: 'public_reader@campus.edu',
      password: 'PublicReaderPassword123!',
    });

    if (error || !data?.session?.access_token) {
      const reg = await supabase.auth.signUp({
        email: 'public_reader@campus.edu',
        password: 'PublicReaderPassword123!',
        options: { data: { full_name: 'Public Reader', role: 'student' } },
      });
      data = reg.data;
    }

    if (data?.session?.access_token) {
      publicReadToken = data.session.access_token;
      publicReadTokenExp = data.session.expires_at || (now + 3600);
      return createScopedClient(publicReadToken);
    }
  } catch (err) {
    console.warn('⚠️ Could not obtain public reader token, falling back to anon client:', err);
  }
  return supabase;
};

export default supabase;
