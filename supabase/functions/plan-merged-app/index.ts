import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    const { prompt, targetStack, knowledge } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");

    if (!openaiKey && !groqKey) {
      return new Response(
        JSON.stringify({
          summary: "Fallback plan generated without external AI key.",
          architecture: {
            frontend: ["Next.js 15", "TypeScript", "Tailwind CSS", "shadcn/ui"],
            backend: ["Supabase Auth", "Supabase Postgres", "Supabase Realtime", "Edge Functions"],
            database: ["Multi-tenant workspace tables", "Project resources", "Integration mappings"],
            integrations: ["GitHub", "AI planner", "artifact export"]
          },
          pages: [
            { path: "/dashboard", title: "Dashboard", purpose: "Overview of projects and activity" },
            { path: "/forge/[id]", title: "Forge Workspace", purpose: "Merged project management" },
            { path: "/forge/[id]/builder", title: "Builder", purpose: "Plan and generate merged app artifacts" }
          ],
          routes: [
            { path: "/api/forge/[id]/builder/analyze", method: "POST", purpose: "Analyze linked repos" },
            { path: "/api/forge/[id]/builder/plan", method: "POST", purpose: "Create merged architecture plan" },
            { path: "/api/forge/[id]/builder/generate", method: "POST", purpose: "Generate artifacts" }
          ],
          schema: [
            { table: "projects", columns: ["id", "forge_id", "name", "status"] },
            { table: "project_integrations", columns: ["id", "project_id", "provider", "config"] }
          ],
          env_vars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
          tasks: [
            `Interpret prompt: ${prompt}`,
            "Review linked repo capabilities",
            "Generate merged app scaffold"
          ],
          knowledge
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const promptText = `
You are MergeForge Planner AI.

Create a merged full-stack app architecture from these linked repositories.

User prompt:
${prompt}

Target stack:
${JSON.stringify(targetStack, null, 2)}

Repo knowledge:
${JSON.stringify(knowledge, null, 2)}

Return strict JSON with keys:
summary, architecture, pages, routes, schema, env_vars, tasks
`.trim();

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You produce valid JSON only." },
            { role: "user", content: promptText }
          ]
        })
      });

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;

      return new Response(content, {
        headers: { "Content-Type": "application/json" }
      });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You produce valid JSON only." },
          { role: "user", content: promptText }
        ]
      })
    });

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;

    return new Response(content, {
      headers: { "Content-Type": "application/json" }
    });
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
