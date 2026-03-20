import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: forgeId } = await params;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, targetStack } = await request.json();

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("builder_sessions")
    .insert({
      forge_id: forgeId,
      created_by: user.id,
      prompt,
      target_stack: targetStack || {
        frontend: "Next.js 15",
        backend: "Supabase",
        styling: "Tailwind CSS + shadcn/ui"
      },
      status: "planning"
    })
    .select("*")
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message || "Failed to create session" }, { status: 400 });
  }

  const { data: analyses } = await supabase
    .from("repo_analysis_cache")
    .select("summary, dependencies, env_vars, services")
    .eq("forge_id", forgeId);

  const knowledge = {
    repos: (analyses || []).map((row: any) => row.summary),
    sharedConcepts: [],
    conflicts: [],
    opportunities: []
  };

  const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/plan-merged-app`;

  const fnRes = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      forgeId,
      prompt,
      targetStack: session.target_stack,
      knowledge
    })
  });

  const planJson = await fnRes.json();

  await supabase
    .from("builder_sessions")
    .update({
      status: "draft",
      summary: planJson.summary || "Merged architecture plan",
      plan: planJson,
      updated_at: new Date().toISOString()
    })
    .eq("id", session.id);

  await supabase.from("builder_artifacts").insert({
    session_id: session.id,
    path: "plans/architecture-plan.json",
    content: JSON.stringify(planJson, null, 2),
    artifact_type: "plan"
  });

  return NextResponse.json({
    success: true,
    sessionId: session.id,
    plan: planJson
  });
}
