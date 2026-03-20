"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

export function CreateForgeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit() {
    startTransition(async () => {
      const res = await fetch("/dashboard/create-forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to create Forge");
        return;
      }
      toast.success("Forge created");
      setOpen(false);
      router.push(`/forge/${json.id}`);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Forge</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Forge</DialogTitle>
          <DialogDescription>
            A Forge is your unified workspace for multiple repositories.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            placeholder="Forge name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={pending || !name.trim()}>
            {pending ? "Creating..." : "Create Forge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
