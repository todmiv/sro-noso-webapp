// Simple test function as suggested by the user
// Deno.serve(async (req) => {
//   if (req.method !== "POST") return new Response("Only POST", { status: 405 });

//   const { inn } = await req.json().catch(() => ({ inn: null }));
//   if (!inn) return new Response("inn required", { status: 400 });

//   // TODO: здесь будет парсинг
//   return new Response(JSON.stringify({ inn, status: "ok" }), {
//     headers: { "Content-Type": "application/json" },
//   });
// });

// Global function that doesn't require Deno global
function handler(req: Request): Promise<Response> {
  // Define CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  return handlerLogic();

  async function handlerLogic(): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
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

      return new Response(JSON.stringify({ inn, status: "ok", success: true, result: { found: true, name: "Test", status: "Member", registrationDate: "2024-01-01" } }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message, success: false }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
}

export default handler;

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reestr-parser' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
