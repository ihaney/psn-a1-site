import { supabase } from './supabase';

/**
 * Logs a search query to the search_queries_log table via the Edge Function
 * @param queryText The search query text
 * @param searchMode The search mode ('products' or 'suppliers')
 */
export async function logSearchQuery(
  queryText: string, 
  searchMode: 'products' | 'suppliers'
): Promise<void> {
  // Don't log empty queries
  if (!queryText.trim()) {
    return;
  }
  
  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert directly to the database for simplicity
    await supabase
      .from('search_queries_log')
      .insert({
        query_text: queryText.trim(),
        search_mode: searchMode,
        user_id: user?.id || null
      });
  } catch (error) {
    // Log error but don't disrupt user experience
    console.error('Failed to log search query:', error);
  }
}