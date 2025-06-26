import { createClient } from '@supabase/supabase-js';

// Expose these in your Vercel/Netlify env settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase credentials are not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
