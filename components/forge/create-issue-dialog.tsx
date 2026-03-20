"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { LinkedRepo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateIssueDialog({
  forgeId,
  repos,
  onCreated
}: {
  forgeId: string;
  repos: LinkedRepo[];
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sourceRepoId, setSourceRepoId] = useState("");
  const [createInGithub, setCreateInGithub] = useState(false);

  async function handleSubmit() {
    startTransition(async () => {
      const res = await fetch(`/api/forge/${forgeId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          sourceRepoId: createInGithub ? sourceRepoId || null : null,
          createInGithub
        })
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to create issue");
        return;
      }

      toast.success("Issue created");
      setTitle("");
      setBody("");
      setSourceRepoId("");
      setCreateInGithub(false);
      setOpen(false);
      onCreated?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Issue</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create issue</DialogTitle>
          <DialogDescription>
            Create a GitHub-backed issue or a virtual unified issue.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Input
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Issue description"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={createInGithub}
              onChange={(e) => setCreateInGithub(e.target.checked)}
            />
            Also create this in GitHub
          </label>

          {createInGithub ? (
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={sourceRepoId}
              onChange={(e) => setSourceRepoId(e.target.value)}
            >
              <option value="">Select repo</option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.github_repo_full_name}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            disabled={pending || !title.trim() || (createInGithub && !sourceRepoId)}
            onClick={handleSubmit}
          >
            {pending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
