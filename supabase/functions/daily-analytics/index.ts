import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get target date from query params or default to yesterday
    const url = new URL(req.url)
    const targetDateParam = url.searchParams.get('date')
    
    let targetDate: string
    if (targetDateParam) {
      targetDate = targetDateParam
    } else {
      // Default to yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      targetDate = yesterday.toISOString().split('T')[0]
    }

    console.log(`Calculating metrics for date: ${targetDate}`)

    // Call the database function to calculate metrics
    const { error } = await supabaseClient.rpc('calculate_daily_metrics', {
      target_date: targetDate
    })

    if (error) {
      console.error('Error calculating daily metrics:', error)
      return new Response('Database error', {
        status: 500,
        headers: corsHeaders
      })
    }

    // Fetch the calculated metrics to return
    const { data: metrics, error: fetchError } = await supabaseClient
      .from('lead_metrics_summary')
      .select('*')
      .eq('date', targetDate)
      .single()

    if (fetchError) {
      console.error('Error fetching calculated metrics:', fetchError)
      return new Response('Error fetching metrics', {
        status: 500,
        headers: corsHeaders
      })
    }

    console.log(`Metrics calculated for ${targetDate}:`, metrics)

    return new Response(JSON.stringify({
      success: true,
      date: targetDate,
      metrics: metrics
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error in daily-analytics function:', error)
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders
    })
  }
})