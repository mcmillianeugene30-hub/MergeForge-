"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SyncButton({ forgeId }: { forgeId: string }) {
  const [pending, startTransition] = useTransition();

  function handleSync() {
    startTransition(async () => {
      const res = await fetch(`/api/forge/${forgeId}/sync`, {
        method: "POST"
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Sync failed");
        return;
      }

      toast.success("Sync complete");
      window.location.reload();
    });
  }

  return (
    <Button onClick={handleSync} disabled={pending}>
      {pending ? "Syncing..." : "Sync GitHub"}
    </Button>
  );
}
