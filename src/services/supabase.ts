import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
