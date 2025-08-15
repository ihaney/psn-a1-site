import { QueryClient } from '@tanstack/react-query';
import { logError } from './errorLogging';
import { isBrowser } from './isomorphic-helpers';

const CACHE_KEY_PREFIX = 'paisan_cache_';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function createPersistentCache(queryClient: QueryClient) {
  // Load persisted queries on startup
  try {
    if (!isBrowser) return;
    
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    for (const key of cacheKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const cache: CacheEntry<unknown> = JSON.parse(raw);
      
      // Remove expired cache entries
      if (Date.now() - cache.timestamp > CACHE_TTL) {
        localStorage.removeItem(key);
        continue;
      }

      // Restore cache to React Query
      const queryKey = JSON.parse(key.replace(CACHE_KEY_PREFIX, ''));
      queryClient.setQueryData(queryKey, cache.data);
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Cache initialization failed'), {
      source: 'cache'
    });
  }

  // Subscribe to cache updates
  queryClient.getQueryCache().subscribe(event => {
    if (!isBrowser) return;
    
    if (!event.query.isActive()) return;

    try {
      const queryKey = JSON.stringify(event.query.queryKey);
      const cacheKey = `${CACHE_KEY_PREFIX}${queryKey}`;

      if (event.type === 'updated' && event.action.type === 'success') {
        const entry: CacheEntry<unknown> = {
          data: event.query.state.data,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Cache update failed'), {
        source: 'cache',
        queryKey: event.query.queryKey
      });
    }
  });
}