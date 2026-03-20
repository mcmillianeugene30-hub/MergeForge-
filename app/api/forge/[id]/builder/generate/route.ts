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

  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const { data: session } = await supabase
    .from("builder_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("forge_id", forgeId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await supabase
    .from("builder_sessions")
    .update({
      status: "generating",
      updated_at: new Date().toISOString()
    })
    .eq("id", sessionId);

  const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-app-artifacts`;

  const fnRes = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      forgeId,
      sessionId,
      prompt: session.prompt,
      targetStack: session.target_stack,
      plan: session.plan
    })
  });

  const result = await fnRes.json();

  if (!fnRes.ok) {
    await supabase
      .from("builder_sessions")
      .update({
        status: "failed",
        updated_at: new Date().toISOString()
      })
      .eq("id", sessionId);

    return NextResponse.json({ error: result.error || "Generation failed" }, { status: 500 });
  }

  if (Array.isArray(result.artifacts) && result.artifacts.length > 0) {
    await supabase.from("builder_artifacts").insert(
      result.artifacts.map((artifact: any) => ({
        session_id: sessionId,
        path: artifact.path,
        content: artifact.content,
        artifact_type: artifact.artifact_type || "code"
      }))
    );
  }

  await supabase
    .from("builder_sessions")
    .update({
      status: "completed",
      updated_at: new Date().toISOString()
    })
    .eq("id", sessionId);

  return NextResponse.json({
    success: true,
    artifacts: result.artifacts || []
  });
}
