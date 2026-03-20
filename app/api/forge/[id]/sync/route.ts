import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOctokit } from "@/lib/github";

function mapIssueStateToBoard(state: string) {
  if (state === "closed") return "done";
  return "todo";
}

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
    supabase.from("linked_repos").select("*").eq("forge_id", forgeId)
  ]);

  if (!githubAccount?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  if (!linkedRepos?.length) {
    return NextResponse.json({ error: "No linked repos" }, { status: 400 });
  }

  const octokit = getOctokit(githubAccount.access_token);

  for (const repoRow of linkedRepos) {
    const [owner, repo] = repoRow.github_repo_full_name.split("/");

    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: "all",
      per_page: 100
    });

    const prs = await octokit.paginate(octokit.rest.pulls.list, {
      owner,
      repo,
      state: "open",
      per_page: 100
    });

    const issueRows = issues
      .filter((item) => !("pull_request" in item))
      .map((issue, index) => ({
        forge_id: forgeId,
        source_repo_id: repoRow.id,
        github_issue_number: issue.number,
        title: issue.title,
        body: issue.body || null,
        status: mapIssueStateToBoard(issue.state),
        labels: issue.labels.map((l: any) => ("name" in l ? l.name : String(l))),
        assignee_ids: [],
        milestone: issue.milestone?.title || null,
        linked_pr_url: null,
        github_issue_url: issue.html_url,
        source_type: "github",
        source_repo_name: repoRow.github_repo_full_name,
        issue_type: "issue",
        position: (index + 1) * 1000,
        updated_at: new Date().toISOString()
      }));

    for (const row of issueRows) {
      const { data: existing } = await supabase
        .from("unified_issues")
        .select("id")
        .eq("forge_id", forgeId)
        .eq("source_repo_id", repoRow.id)
        .eq("github_issue_number", row.github_issue_number)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("unified_issues")
          .update(row)
          .eq("id", existing.id);
      } else {
        await supabase.from("unified_issues").insert(row);
      }
    }

    const prRows = prs.map((pr) => ({
      forge_id: forgeId,
      repo_id: repoRow.id,
      pr_number: pr.number,
      title: pr.title,
      state: pr.state,
      author: pr.user?.login || null,
      pr_url: pr.html_url,
      related_issue_numbers: [],
      mergeable_state: null,
      head_ref: pr.head.ref,
      base_ref: pr.base.ref,
      updated_at: pr.updated_at,
      created_at: pr.created_at
    }));

    for (const row of prRows) {
      const { data: existing } = await supabase
        .from("pr_activity")
        .select("id")
        .eq("forge_id", forgeId)
        .eq("repo_id", repoRow.id)
        .eq("pr_number", row.pr_number)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from("pr_activity").update(row).eq("id", existing.id);
      } else {
        await supabase.from("pr_activity").insert(row);
      }
    }

    await supabase
      .from("linked_repos")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", repoRow.id);

    await supabase.from("activity_events").insert({
      forge_id: forgeId,
      repo_id: repoRow.id,
      event_type: "sync",
      title: `Synced ${repoRow.github_repo_full_name}`,
      actor: user.email,
      metadata: {
        issues: issueRows.length,
        prs: prRows.length
      }
    });
  }

  return NextResponse.json({ success: true });
}
