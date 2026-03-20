import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOctokit } from "@/lib/github";

export async function GET(
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

  const { data, error } = await supabase
    .from("unified_issues")
    .select("*")
    .eq("forge_id", forgeId)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ issues: data ?? [] });
}

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

  const body = await request.json();
  const title = String(body.title || "").trim();
  const description = String(body.body || "").trim();
  const sourceRepoId = body.sourceRepoId ? String(body.sourceRepoId) : null;
  const createInGithub = Boolean(body.createInGithub);

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let githubIssueNumber: number | null = null;
  let githubIssueUrl: string | null = null;
  let sourceRepoName: string | null = null;

  if (createInGithub) {
    if (!sourceRepoId) {
      return NextResponse.json({ error: "Repo is required" }, { status: 400 });
    }

    const { data: linkedRepo, error: repoError } = await supabase
      .from("linked_repos")
      .select("id, github_repo_full_name")
      .eq("id", sourceRepoId)
      .eq("forge_id", forgeId)
      .single();

    if (repoError || !linkedRepo) {
      return NextResponse.json({ error: "Linked repo not found" }, { status: 404 });
    }

    const { data: githubAccount, error: githubError } = await supabase
      .from("github_accounts")
      .select("access_token")
      .eq("user_id", user.id)
      .single();

    if (githubError || !githubAccount?.access_token) {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
    }

    const [owner, repo] = linkedRepo.github_repo_full_name.split("/");

    const octokit = getOctokit(githubAccount.access_token);

    const ghIssue = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body: description || undefined
    });

    githubIssueNumber = ghIssue.data.number;
    githubIssueUrl = ghIssue.data.html_url;
    sourceRepoName = linkedRepo.github_repo_full_name;
  }

  const { data, error } = await supabase
    .from("unified_issues")
    .insert({
      forge_id: forgeId,
      source_repo_id: sourceRepoId,
      github_issue_number: githubIssueNumber,
      title,
      body: description || null,
      status: "todo",
      labels: [],
      assignee_ids: [],
      milestone: null,
      linked_pr_url: null,
      github_issue_url: githubIssueUrl,
      source_type: createInGithub ? "github" : "virtual",
      source_repo_name: sourceRepoName,
      issue_type: "issue",
      position: 1000,
      created_by: user.id
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("activity_events").insert({
    forge_id: forgeId,
    repo_id: sourceRepoId,
    event_type: "issue",
    title: `Created issue: ${title}`,
    actor: user.email,
    source_url: githubIssueUrl,
    metadata: {
      unified_issue_id: data.id,
      source_type: createInGithub ? "github" : "virtual"
    }
  });

  return NextResponse.json({ issue: data });
}
