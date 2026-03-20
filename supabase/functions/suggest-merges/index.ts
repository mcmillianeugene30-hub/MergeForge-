import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    const { prs, issues } = await req.json();

    const prompt = `
You are MergeForge AI.
Analyze these pull requests and issues across multiple repositories.
Return JSON with:
- groups: array of related PR/issue groupings
- suggestions: array of recommendations
- risks: array of possible conflicts

Data:
${JSON.stringify({ prs, issues })}
    `.trim();

    const apiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          groups: [],
          suggestions: [],
          risks: [],
          message: "No AI API key configured"
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        groups: [],
        suggestions: ["Phase 1 stub: wire OpenAI/Groq call here."],
        risks: []
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
