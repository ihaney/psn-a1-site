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

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  console.error('Missing Meilisearch environment variables. Available env vars:', Object.keys(import.meta.env));
  throw new Error('Missing Meilisearch environment variables: VITE_MEILISEARCH_HOST and VITE_MEILISEARCH_API_KEY');
}

const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY
});

export const productsIndex = searchClient.index('products');
export const suppliersIndex = searchClient.index('suppliers');