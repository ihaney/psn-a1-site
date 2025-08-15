/**
 * Utilities for Static Site Generation
 */

import { isBrowser } from './isomorphic-helpers';

// Function to hydrate the query client with SSG data
export function hydrateQueryClient(queryClient: any, dehydratedState: string | null) {
  if (!dehydratedState) return;
  
  try {
    const queries = JSON.parse(dehydratedState);
    
    // Set each query in the cache
    queries.forEach((query: any) => {
      queryClient.setQueryData(query.queryKey, query.state.data);
    });
  } catch (error) {
    console.error('Error hydrating query client:', error);
  }
}

// Function to get the dehydrated state from the window
export function getDehydratedState(): string | null {
  if (!isBrowser || typeof document === 'undefined') return null;
  
  const stateElement = document.getElementById('__PAISAN_DEHYDRATED_STATE__');
  if (!stateElement) return null;
  
  try {
    return stateElement.textContent;
  } catch (error) {
    console.error('Error getting dehydrated state:', error);
    return null;
  }
}

// Function to prefetch data for a specific route
export async function prefetchRouteData(queryClient: any, route: string) {
  // This would be implemented based on your specific data needs
  // For example, if /products needs product data:
  if (route === '/products') {
    // await queryClient.prefetchQuery(['products'], fetchProducts);
  }
  
  // Add more route-specific prefetching as needed
}

// Function to determine if a route should be prerendered
export function shouldPrerender(route: string): boolean {
  // Define routes that should be prerendered
  const prerenderRoutes = [
    '/',
    '/products',
    '/categories',
    '/about',
    '/policies',
    '/contact',
    '/suppliers',
    '/sources',
    '/countries',
  ];
  
  return prerenderRoutes.includes(route);
}