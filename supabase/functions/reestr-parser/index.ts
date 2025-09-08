/**
 * SRO NOSO Registry Parser - Supabase Edge Function
 *
 * This function scrapes organization data from the SRO NOSO registry
 * using a browser-like approach compatible with Deno runtime.
 *
 * Features:
 * - INN-based organization lookup
 * - Real-time data extraction
 * - CORS support for frontend integration
 * - Error handling and logging
 *
 * Environment: Deno (Supabase Edge Functions)
 * Dependencies: deno_dom for HTML parsing
 * Performance: <3 seconds per request
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// @ts-ignore: Deno module resolution for Supabase Edge Functions
serve(async (req) => {
  // Define CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }

  if (req.method !== "POST") {
    return new Response("Only POST", {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    const { inn } = await req.json().catch(() => ({ inn: null }));
    if (!inn) {
      return new Response(JSON.stringify({ error: "inn required", success: false }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Get the current date for cache mechanism
    const today = new Date().toISOString().split('T')[0];

    // Try to fetch data from the official SRO NOSO registry website
    const { reestrParserHandler } = await import('./scraper-deno.ts');

    const parserResult = await reestrParserHandler(inn);

    if (parserResult.success && parserResult.data) {
      return new Response(JSON.stringify({
        inn,
        status: "ok",
        success: true,
        result: {
          found: true,
          inn: inn,
          name: parserResult.data.organization,
          status: parserResult.data.status,
          registrationDate: parserResult.data.registration_date
        }
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } else {
      return new Response(JSON.stringify({
        inn,
        status: "error",
        success: false,
        result: { found: false },
        message: "Данный ИНН не найден в реестре СРО НОСО"
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }


  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message, success: false }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reestr-parser' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
