import { MeiliSearch } from 'meilisearch';

// Use import.meta.env for Vite environment variables
const MEILISEARCH_HOST = import.meta.env.VITE_MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = import.meta.env.VITE_MEILISEARCH_API_KEY;

console.log('Meilisearch environment variables:', {
  host: !!MEILISEARCH_HOST,
  apiKey: !!MEILISEARCH_API_KEY,
  hostValue: MEILISEARCH_HOST,
  apiKeyLength: MEILISEARCH_API_KEY?.length || 0
});

// Provide fallback values during build to prevent build failures
const host = MEILISEARCH_HOST || 'http://localhost:7700';
const apiKey = MEILISEARCH_API_KEY || 'fallback-key';

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  console.warn('Missing Meilisearch environment variables. Using fallback values for build.');
}

const searchClient = new MeiliSearch({
  host,
  apiKey
});

export const productsIndex = searchClient.index('products');
export const suppliersIndex = searchClient.index('suppliers');