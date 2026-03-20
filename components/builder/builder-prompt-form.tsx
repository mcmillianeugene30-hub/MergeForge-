"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function BuilderPromptForm({ forgeId }: { forgeId: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [pending, startTransition] = useTransition();

  function runPlan() {
    startTransition(async () => {
      const analyzeRes = await fetch(`/api/forge/${forgeId}/builder/analyze`, {
        method: "POST"
      });

      const analyzeJson = await analyzeRes.json();
      if (!analyzeRes.ok) {
        toast.error(analyzeJson.error || "Analysis failed");
        return;
      }

      const planRes = await fetch(`/api/forge/${forgeId}/builder/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          targetStack: {
            frontend: "Next.js 15",
            backend: "Supabase",
            styling: "Tailwind CSS + shadcn/ui",
            auth: "Supabase Auth",
            database: "PostgreSQL"
          }
        })
      });

      const planJson = await planRes.json();
      if (!planRes.ok) {
        toast.error(planJson.error || "Planning failed");
        return;
      }

      toast.success("Plan created");
      router.push(`/forge/${forgeId}/builder/${planJson.sessionId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Build a multi-tenant SaaS dashboard from the linked repos, reuse auth from repo A, reuse workflow automation from repo B, keep mobile responsive..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[140px]"
      />
      <Button onClick={runPlan} disabled={pending || !prompt.trim()}>
        {pending ? "Running..." : "Analyze repos + create plan"}
      </Button>
    </div>
  );
}
