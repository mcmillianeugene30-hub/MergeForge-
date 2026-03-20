import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BuilderPromptForm } from "@/components/builder/builder-prompt-form";
import { BuilderSessionList } from "@/components/builder/builder-session-list";
import { RepoAnalysisCard } from "@/components/builder/repo-analysis-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ForgeBuilderPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const supabase = await createClient();

  const [{ data: forge }, { data: analyses }, { data: sessions }] = await Promise.all([
    supabase.from("forges").select("id, name, description").eq("id", id).maybeSingle(),
    supabase.from("repo_analysis_cache").select("*").eq("forge_id", id).order("updated_at", { ascending: false }),
    supabase.from("builder_sessions").select("*").eq("forge_id", id).order("created_at", { ascending: false })
  ]);

  if (!forge) notFound();

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{forge.name} Builder</h1>
        <p className="text-muted-foreground">
          Analyze linked repos, create a merged architecture, and generate app artifacts.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Create builder session</CardTitle>
          <CardDescription>
            Describe the full-stack app you want generated from this Forge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BuilderPromptForm forgeId={id} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <RepoAnalysisCard forgeId={id} analyses={analyses || []} />
        <BuilderSessionList forgeId={id} sessions={sessions || []} />
      </div>

      <div>
        <Link
          href={`/forge/${id}`}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Back to Forge
        </Link>
      </div>
    </main>
  );
}
