import { createClient } from '@supabase/supabase-js';

// Safely try to get environment variables, handling cases where import.meta.env might be undefined
const getEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key];
  } catch (e) {
    return undefined;
  }
};

const envUrl = getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Fallback credentials to ensure app runs in preview environments
// without explicit .env file support or if injection fails
const FALLBACK_URL = 'https://seblnofdmrhvfcqgkike.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlYmxub2ZkbXJodmZjcWdraWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjkyMzEsImV4cCI6MjA4NTcwNTIzMX0.SPIttkTWoaXz46rzFa2z5bHjMy_WQN6avMW1eOGA__4';

const supabaseUrl = envUrl || FALLBACK_URL;
const supabaseKey = envKey || FALLBACK_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing and no fallback provided.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);