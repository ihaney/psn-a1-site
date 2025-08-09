import { supabase } from './supabase';

interface ErrorLog {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  error?: string;
  success?: boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;
      
      if (retries < maxRetries) {
        const delay = baseDelay * Math.pow(2, retries - 1) * (0.5 + Math.random());
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function logError(error: Error | string, context?: Record<string, any>, severity: ErrorLog['severity'] = 'error') {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Get current user and session
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Build error context with user info
  const errorContext = {
    ...context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
    userId: user?.id,
    sessionId: session?.id,
    authStatus: user ? 'authenticated' : 'unauthenticated'
  };

  const errorLog: ErrorLog = {
    message: errorMessage,
    stack: errorStack,
    context: errorContext,
    timestamp: new Date().toISOString(),
    severity,
    userId: user?.id,
    error: errorMessage,
    success: false
  };

  if (import.meta.env.DEV) {
    console.error('Error logged:', {
      ...errorLog,
      fullError: error instanceof Error ? error : undefined,
      context: errorLog.context
    });
  }

  try {
    // First try to insert with authenticated client
    const { error: insertError } = await supabase
      .from('error_logs')
      .insert([errorLog]);

    if (insertError) {
      console.error('Error inserting log:', insertError);
    }
  } catch (loggingError) {
    console.error('Error during error logging:', loggingError);
    console.error('Original error:', errorLog);
  }
}