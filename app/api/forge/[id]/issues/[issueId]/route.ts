import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; issueId: string }> }
) {
  const supabase = await createClient();
  const { id: forgeId, issueId } = await params;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("unified_issues")
    .update({
      status: body.status,
      position: body.position,
      updated_at: new Date().toISOString()
    })
    .eq("id", issueId)
    .eq("forge_id", forgeId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ issue: data });
}
