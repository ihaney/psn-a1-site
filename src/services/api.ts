import { supabase } from '../lib/supabase';

export async function fetchAllSources() {
  const { data, error } = await supabase
    .from('Sources')
    .select('Source_ID, Source_Title');

  if (error) throw error;
  return data;
}