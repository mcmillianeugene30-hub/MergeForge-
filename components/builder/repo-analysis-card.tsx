"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RepoAnalysisCard({
  forgeId,
  analyses
}: {
  forgeId: string;
  analyses: any[];
}) {
  const [pending, startTransition] = useTransition();

  function rerun() {
    startTransition(async () => {
      const res = await fetch(`/api/forge/${forgeId}/builder/analyze`, {
        method: "POST"
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Analysis failed");
        return;
      }

      toast.success("Repo analysis updated");
      window.location.reload();
    });
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Repo Analysis Cache</CardTitle>
        <Button onClick={rerun} disabled={pending}>
          {pending ? "Analyzing..." : "Run analysis"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No repo analysis yet.</p>
        ) : (
          analyses.map((item) => (
            <div key={item.id} className="rounded-xl border p-3">
              <div className="font-medium">{item.summary?.repo || "Repo"}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Services: {(item.services || []).join(", ") || "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                Env vars: {(item.env_vars || []).slice(0, 8).join(", ") || "—"}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
