import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OverviewStats } from "@/components/forge/overview-stats";
import { ActivityFeedPreview } from "@/components/forge/activity-feed-preview";
import { RepoHealthCard } from "@/components/forge/repo-health-card";
import { BoardView } from "@/components/forge/board-view";
import { RepoPicker } from "@/components/forge/repo-picker";
import { SyncButton } from "@/components/forge/sync-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ForgePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const supabase = await createClient();

  const { data: forge } = await supabase
    .from("forges")
    .select("id, name, description, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!forge) notFound();

  const [
    { count: reposCount },
    { count: issuesCount },
    { count: prsCount },
    { count: milestonesCount },
    { data: repos },
    { data: activity },
    { data: issues }
  ] = await Promise.all([
    supabase.from("linked_repos").select("*", { count: "exact", head: true }).eq("forge_id", id),
    supabase.from("unified_issues").select("*", { count: "exact", head: true }).eq("forge_id", id).neq("status", "done"),
    supabase.from("pr_activity").select("*", { count: "exact", head: true }).eq("forge_id", id).eq("state", "open"),
    supabase.from("forge_milestones").select("*", { count: "exact", head: true }).eq("forge_id", id),
    supabase.from("linked_repos").select("*").eq("forge_id", id).order("created_at", { ascending: false }),
    supabase.from("activity_events").select("id, event_type, title, actor, created_at").eq("forge_id", id).order("created_at", { ascending: false }).limit(8),
    supabase.from("unified_issues").select("*").eq("forge_id", id).order("position", { ascending: true })
  ]);

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{forge.name}</h1>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {forge.status}
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">
            {forge.description || "No description yet."}
          </p>
        </div>
        <SyncButton forgeId={id} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="repos">Repos</TabsTrigger>
          <TabsTrigger value="merge-center">Merge Center</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewStats
            stats={{
              repos: reposCount ?? 0,
              openIssues: issuesCount ?? 0,
              openPrs: prsCount ?? 0,
              milestones: milestonesCount ?? 0
            }}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    Your unified cross-repo command center.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <div className="mb-2 font-medium">Unified issue flow</div>
                    <p className="text-sm text-muted-foreground">
                      Pull multiple repos into one board and move work across stages.
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="mb-2 font-medium">AI merge analysis</div>
                    <p className="text-sm text-muted-foreground">
                      Phase 3 will generate code and merge-aware app plans from your repos.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <ActivityFeedPreview events={activity ?? []} />
            </div>
            <RepoHealthCard repos={repos ?? []} />
          </div>
        </TabsContent>

        <TabsContent value="board">
          <BoardView forgeId={id} initialIssues={(issues ?? []) as any} repos={(repos ?? []) as any} />
        </TabsContent>

        <TabsContent value="repos">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Link repositories</CardTitle>
                <CardDescription>
                  Select GitHub repos to add to this Forge.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RepoPicker forgeId={id} />
              </CardContent>
            </Card>
            <RepoHealthCard repos={(repos ?? []) as any} />
          </div>
        </TabsContent>

        <TabsContent value="merge-center">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Merge Center</CardTitle>
              <CardDescription>
                Next phase: PR relationship analysis, linked issues, and AI suggestions.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeedPreview events={activity ?? []} />
        </TabsContent>

        <TabsContent value="builder">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>App Builder</CardTitle>
              <CardDescription>
                Analyze linked repos and generate a merged full-stack app plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={`/forge/${id}/builder`}
                className="inline-flex rounded-md border px-4 py-2 text-sm"
              >
                Open Builder
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
