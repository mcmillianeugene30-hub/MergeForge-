"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useBoardRealtime(forgeId: string, onRefresh: () => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`forge-board-${forgeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "unified_issues",
          filter: `forge_id=eq.${forgeId}`
        },
        () => onRefresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [forgeId, onRefresh]);
}
