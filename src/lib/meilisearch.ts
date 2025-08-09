import { MeiliSearch } from 'meilisearch';

// Use import.meta.env for Vite environment variables
const MEILISEARCH_HOST = import.meta.env.VITE_MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = import.meta.env.VITE_MEILISEARCH_API_KEY;

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  throw new Error('Missing Meilisearch environment variables');
}

const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY
});

export const productsIndex = searchClient.index('products');
export const suppliersIndex = searchClient.index('suppliers');