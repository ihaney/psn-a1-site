import { createClient } from '@supabase/supabase-js';
import { retryWithBackoff } from './errorLogging';

// Use import.meta.env for Vite environment variables in browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // console.error('Missing Supabase environment variables:', {
  //   url: !!supabaseUrl,
  //   key: !!supabaseAnonKey
  // });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  // console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check VITE_SUPABASE_URL in your .env file.');
}

// console.log('Initializing Supabase client with URL:', supabaseUrl);

let supabase: any;

try {
  console.log('Attempting to initialize Supabase client...');
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
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
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length || 0
  });
  throw new Error(`Supabase client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

export { supabase };
