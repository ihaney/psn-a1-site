import { createClient } from '@supabase/supabase-js';
import { retryWithBackoff } from './errorLogging';

// Use import.meta.env for Vite environment variables in browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide fallback values during build to prevent build failures
const url = supabaseUrl || 'https://placeholder.supabase.co';
const anonKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback values for build.');
}

// Validate URL format
try {
  new URL(url);
} catch (error) {
  console.warn('Invalid Supabase URL format. Using fallback for build.');
}

// console.log('Initializing Supabase client with URL:', supabaseUrl);

let supabase: any;

try {
  console.log('Attempting to initialize Supabase client...');
  supabase = createClient(
    url,
    anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
        }
      }
    }
  );
  console.log('✅ Supabase client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  console.error('Environment variables:', {
    url,
    keyLength: anonKey?.length || 0
  });
  console.warn(`Supabase client initialization failed during build: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

export { supabase };
