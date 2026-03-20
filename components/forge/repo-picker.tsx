"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type GithubRepo = {
  id: number;
  full_name: string;
  private: boolean;
  default_branch: string;
};

export function RepoPicker({ forgeId }: { forgeId: string }) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;

    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((json) => {
        if (mounted) {
          setRepos(json.repos || []);
          setLoading(false);
        }
      })
      .catch(() => {
        toast.error("Failed to load repos");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function toggle(id: number) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function submit() {
    startTransition(async () => {
      const chosen = repos.filter((repo) => selected[repo.id]);

      const res = await fetch(`/api/forge/${forgeId}/repos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos: chosen })
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to link repos");
        return;
      }

      toast.success("Repos linked");
      window.location.reload();
    });
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading GitHub repos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[320px] space-y-2 overflow-auto rounded-xl border p-3">
        {repos.map((repo) => (
          <label
            key={repo.id}
            className="flex cursor-pointer items-center justify-between rounded-lg border p-3"
          >
            <div>
              <div className="font-medium">{repo.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {repo.private ? "Private" : "Public"} • {repo.default_branch}
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(selected[repo.id])}
              onChange={() => toggle(repo.id)}
            />
          </label>
        ))}
      </div>

      <Button onClick={submit} disabled={pending}>
        {pending ? "Linking..." : "Link selected repos"}
      </Button>
    </div>
  );
}
