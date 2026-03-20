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

  const { repos } = await request.json();

  if (!Array.isArray(repos) || repos.length === 0) {
    return NextResponse.json({ error: "No repos selected" }, { status: 400 });
  }

  const { data: githubAccount } = await supabase
    .from("github_accounts")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const rows = repos.map((repo: any) => ({
    forge_id: forgeId,
    github_account_id: githubAccount?.id ?? null,
    github_repo_full_name: repo.full_name,
    github_repo_id: repo.id,
    default_branch: repo.default_branch,
    private: repo.private
  }));

  const { error } = await supabase.from("linked_repos").upsert(rows, {
    onConflict: "forge_id,github_repo_full_name"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
