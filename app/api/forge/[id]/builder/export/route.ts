import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: forgeId } = await params;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const { data: session } = await supabase
    .from("builder_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("forge_id", forgeId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: artifacts } = await supabase
    .from("builder_artifacts")
    .select("path, content, artifact_type")
    .eq("session_id", sessionId)
    .order("path", { ascending: true });

  return NextResponse.json({
    sessionId,
    forgeId,
    artifacts: artifacts || []
  });
}
