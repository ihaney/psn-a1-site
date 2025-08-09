import { QueryClient } from '@tanstack/react-query';
import { logError } from './errorLogging';
import { createPersistentCache } from './cache';

// Create a client for SSR/SSG
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        onError: (error) => {
          logError(error instanceof Error ? error : new Error(String(error)), {
            source: 'react-query'
          });
        },
        // For SSG, we want to use the cache and not refetch
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      }
    }
  });
};

// Export a singleton instance for client-side use
export const queryClient = createQueryClient();

// Initialize persistent cache for client-side
if (typeof window !== 'undefined') {
  createPersistentCache(queryClient);
}