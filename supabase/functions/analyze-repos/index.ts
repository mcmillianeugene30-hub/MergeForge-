import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Use app/api/forge/[id]/builder/analyze for GitHub ingestion; this function can be expanded for heavier AI summarization.",
        received: payload
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
