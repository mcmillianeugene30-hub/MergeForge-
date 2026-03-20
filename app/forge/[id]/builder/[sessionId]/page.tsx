import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArtifactTree } from "@/components/builder/artifact-tree";
import { ArtifactViewer } from "@/components/builder/artifact-viewer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function BuilderSessionPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; sessionId: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  await requireUser();
  const { id: forgeId, sessionId } = await params;
  const sp = await searchParams;
  const selectedPath = sp.path;

  const supabase = await createClient();

  const [{ data: session }, { data: artifacts }] = await Promise.all([
    supabase
      .from("builder_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("forge_id", forgeId)
      .maybeSingle(),
    supabase
      .from("builder_artifacts")
      .select("*")
      .eq("session_id", sessionId)
      .order("path", { ascending: true })
  ]);

  if (!session) notFound();

  const selected =
    artifacts?.find((a) => a.path === selectedPath) || artifacts?.[0] || null;

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Builder Session</CardTitle>
          <CardDescription>{session.prompt}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm"><strong>Status:</strong> {session.status}</div>
          <div className="text-sm text-muted-foreground">{session.summary || "No summary yet."}</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ArtifactTree forgeId={forgeId} sessionId={sessionId} artifacts={artifacts || []} />
        <ArtifactViewer artifact={selected} />
      </div>
    </main>
  );
}
