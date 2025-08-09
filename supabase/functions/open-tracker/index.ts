import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 1x1 transparent GIF in base64
const TRANSPARENT_GIF = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extract lead_id from URL path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const leadId = pathParts[pathParts.length - 1]?.replace('.gif', '')

    if (!leadId) {
      console.error('No lead_id found in URL:', url.pathname)
      return new Response(
        Uint8Array.from(atob(TRANSPARENT_GIF), c => c.charCodeAt(0)),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update the opened_at timestamp for the lead
    const { error } = await supabaseClient
      .from('leads')
      .update({ opened_at: new Date().toISOString() })
      .eq('lead_id', leadId)
      .is('opened_at', null) // Only update if not already opened

    if (error) {
      console.error('Error updating lead:', error)
    } else {
      console.log(`Lead ${leadId} marked as opened`)
    }

    // Return 1x1 transparent GIF
    return new Response(
      Uint8Array.from(atob(TRANSPARENT_GIF), c => c.charCodeAt(0)),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Error in open-tracker:', error)
    
    // Always return the GIF even if there's an error
    return new Response(
      Uint8Array.from(atob(TRANSPARENT_GIF), c => c.charCodeAt(0)),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
})