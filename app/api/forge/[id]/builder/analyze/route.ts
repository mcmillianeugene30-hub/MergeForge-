import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getImportantFilesFromRepo, extractPackageSignals } from "@/lib/github-ingest";

export async function POST(
  _request: Request,
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

  const [{ data: githubAccount }, { data: linkedRepos }] = await Promise.all([
    supabase
      .from("github_accounts")
      .select("access_token")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("linked_repos")
      .select("id, github_repo_full_name, default_branch")
      .eq("forge_id", forgeId)
  ]);

  if (!githubAccount?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  if (!linkedRepos?.length) {
    return NextResponse.json({ error: "No linked repos" }, { status: 400 });
  }

  const results = [];

  for (const repo of linkedRepos) {
    const [owner, name] = repo.github_repo_full_name.split("/");

    const ingest = await getImportantFilesFromRepo(
      githubAccount.access_token,
      owner,
      name,
      repo.default_branch || undefined
    );

    const signals = extractPackageSignals(ingest.files);

    const summary = {
      repo: repo.github_repo_full_name,
      stack: [
        signals.dependencies.includes("next") || signals.dependencies.includes("next.js")
          ? "next.js"
          : null,
        signals.dependencies.includes("@supabase/supabase-js") ? "supabase" : null,
        signals.dependencies.includes("react") ? "react" : null,
        signals.dependencies.includes("tailwindcss") ? "tailwindcss" : null,
        signals.dependencies.includes("@octokit/rest") ? "octokit" : null
      ].filter(Boolean),
      dependencies: signals.dependencies,
      envVars: signals.envVars,
      services: signals.services,
      routes: signals.routes,
      dbModels: [],
      notes: ingest.files.map((f) => `Indexed ${f.path}`)
    };

    await supabase.from("repo_analysis_cache").upsert(
      {
        forge_id: forgeId,
        linked_repo_id: repo.id,
        summary,
        file_map: ingest.tree,
        dependencies: signals.dependencies,
        env_vars: signals.envVars,
        services: signals.services,
        updated_at: new Date().toISOString()
      },
      { onConflict: "forge_id,linked_repo_id" }
    );

    results.push(summary);
  }

  return NextResponse.json({
    success: true,
    analyses: results
  });
}
