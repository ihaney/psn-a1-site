import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppStatusPayload {
  lead_id: string
  message_id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const payload: WhatsAppStatusPayload = await req.json()
    
    if (!payload.lead_id || !payload.status) {
      return new Response('Missing required fields: lead_id, status', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let updateData: any = {}

    // Update the appropriate timestamp based on status
    switch (payload.status) {
      case 'delivered':
        updateData.delivered_at = new Date(payload.timestamp || new Date()).toISOString()
        break
      case 'read':
        updateData.read_at = new Date(payload.timestamp || new Date()).toISOString()
        break
      default:
        console.log(`Status ${payload.status} not tracked for lead ${payload.lead_id}`)
        return new Response('OK', { headers: corsHeaders })
    }

    // Update the lead record
    const { error } = await supabaseClient
      .from('leads')
      .update(updateData)
      .eq('lead_id', payload.lead_id)

    if (error) {
      console.error('Error updating lead status:', error)
      return new Response('Database error', {
        status: 500,
        headers: corsHeaders
      })
    }

    console.log(`Lead ${payload.lead_id} status updated: ${payload.status}`)

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Error in whatsapp-status webhook:', error)
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders
    })
  }
})