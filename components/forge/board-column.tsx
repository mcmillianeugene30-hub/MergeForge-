"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BoardCard } from "@/components/forge/board-card";
import { UnifiedIssue, BoardStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BoardColumn({
  id,
  title,
  issues
}: {
  id: BoardStatus;
  title: string;
  issues: UnifiedIssue[];
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: "column",
      status: id
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[500px] flex-col rounded-2xl border bg-muted/30 p-3",
        isOver && "ring-2 ring-primary"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full bg-background px-2 py-1 text-xs text-muted-foreground">
          {issues.length}
        </span>
      </div>

      <SortableContext
        items={issues.map((issue) => issue.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {issues.map((issue) => (
            <BoardCard key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
