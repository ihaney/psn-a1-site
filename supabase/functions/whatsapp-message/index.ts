import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessagePayload {
  from: string
  text: string
  timestamp: string
  message_id?: string
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
    const payload: WhatsAppMessagePayload = await req.json()
    
    if (!payload.from || !payload.text) {
      return new Response('Missing required fields: from, text', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First, try to find the supplier_id from the phone mapping
    const { data: phoneMapping } = await supabaseClient
      .from('supplier_phone_mapping')
      .select('supplier_id')
      .eq('phone_number', payload.from)
      .single()

    let supplierId = phoneMapping?.supplier_id

    // If no mapping found, try to find leads directly by lead_id (if from is a lead_id)
    let leadQuery = supabaseClient
      .from('leads')
      .select('lead_id, supplier_id')

    if (supplierId) {
      // Find leads for this supplier that haven't been replied to yet
      leadQuery = leadQuery
        .eq('supplier_id', supplierId)
        .is('replied_at', null)
        .order('sent_at', { ascending: false })
        .limit(1)
    } else {
      // Try to find lead by lead_id directly
      leadQuery = leadQuery
        .eq('lead_id', payload.from)
        .limit(1)
    }

    const { data: leads, error: leadError } = await leadQuery

    if (leadError) {
      console.error('Error finding lead:', leadError)
      return new Response('Database error', {
        status: 500,
        headers: corsHeaders
      })
    }

    if (!leads || leads.length === 0) {
      console.log(`No lead found for phone number/lead_id: ${payload.from}`)
      
      // If we have a supplier_id but no active leads, log it
      if (supplierId) {
        console.log(`Supplier ${supplierId} replied but no active leads found`)
      }
      
      return new Response('No matching lead found', {
        status: 404,
        headers: corsHeaders
      })
    }

    const lead = leads[0]
    const replyTimestamp = new Date(payload.timestamp || new Date()).toISOString()

    // Update the lead with reply timestamp
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({ replied_at: replyTimestamp })
      .eq('lead_id', lead.lead_id)

    if (updateError) {
      console.error('Error updating lead reply:', updateError)
      return new Response('Database error', {
        status: 500,
        headers: corsHeaders
      })
    }

    console.log(`Lead ${lead.lead_id} marked as replied`)

    // If we found a supplier but no phone mapping exists, create one
    if (lead.supplier_id && !supplierId) {
      const { error: mappingError } = await supabaseClient
        .from('supplier_phone_mapping')
        .insert({
          phone_number: payload.from,
          supplier_id: lead.supplier_id
        })

      if (mappingError) {
        console.error('Error creating phone mapping:', mappingError)
        // Don't fail the request for this
      } else {
        console.log(`Created phone mapping: ${payload.from} -> ${lead.supplier_id}`)
      }
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Error in whatsapp-message webhook:', error)
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders
    })
  }
})