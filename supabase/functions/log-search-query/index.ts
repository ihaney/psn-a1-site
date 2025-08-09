import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface SearchQueryPayload {
  query_text: string;
  search_mode: 'products' | 'suppliers';
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Parse the request body
    const payload: SearchQueryPayload = await req.json()

    // Validate required fields
    if (!payload.query_text || !payload.search_mode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: query_text, search_mode' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Validate search_mode
    if (payload.search_mode !== 'products' && payload.search_mode !== 'suppliers') {
      return new Response(
        JSON.stringify({ error: 'Invalid search_mode. Must be "products" or "suppliers"' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert the search query into the log
    const { error } = await supabaseClient
      .from('search_queries_log')
      .insert({
        query_text: payload.query_text,
        search_mode: payload.search_mode,
        user_id: payload.user_id || null
      })

    if (error) {
      console.error('Error logging search query:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log search query' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in log-search-query function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})