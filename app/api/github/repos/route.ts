import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listAllRepos } from "@/lib/github";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: githubAccount } = await supabase
    .from("github_accounts")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (!githubAccount?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  const repos = await listAllRepos(githubAccount.access_token);
  return NextResponse.json({ repos });
}
