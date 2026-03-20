"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";

import { BOARD_COLUMNS } from "@/lib/constants";
import { getNewPosition, groupIssuesByStatus } from "@/lib/board";
import { UnifiedIssue, LinkedRepo, BoardStatus } from "@/lib/types";
import { BoardColumn } from "@/components/forge/board-column";
import { BoardCard } from "@/components/forge/board-card";
import { CreateIssueDialog } from "@/components/forge/create-issue-dialog";
import { useBoardRealtime } from "@/components/forge/use-board-realtime";

export function BoardView({
  forgeId,
  initialIssues,
  repos
}: {
  forgeId: string;
  initialIssues: UnifiedIssue[];
  repos: LinkedRepo[];
}) {
  const [issues, setIssues] = useState<UnifiedIssue[]>(initialIssues);
  const [activeIssue, setActiveIssue] = useState<UnifiedIssue | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const grouped = useMemo(() => groupIssuesByStatus(issues), [issues]);

  function refreshBoard() {
    startTransition(async () => {
      const res = await fetch(`/api/forge/${forgeId}/issues`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setIssues(json.issues);
    });
  }

  useBoardRealtime(forgeId, refreshBoard);

  function findIssue(id: string) {
    return issues.find((issue) => issue.id === id) || null;
  }

  async function persistMove(issueId: string, status: BoardStatus, position: number) {
    const res = await fetch(`/api/forge/${forgeId}/issues/${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, position })
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || "Failed to update issue");
      refreshBoard();
    }
  }

  function handleDragStart(event: any) {
    const issue = findIssue(String(event.active.id));
    setActiveIssue(issue);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over || active.id === over.id) return;

    const activeIssue = findIssue(String(active.id));
    if (!activeIssue) return;

    const overId = String(over.id);

    const targetStatus = BOARD_COLUMNS.some((c) => c.id === overId)
      ? (overId as BoardStatus)
      : (findIssue(overId)?.status ?? activeIssue.status);

    const sourceItems = grouped[activeIssue.status];
    const targetItems =
      targetStatus === activeIssue.status
        ? [...grouped[targetStatus]]
        : [...grouped[targetStatus]];

    const sourceIndex = sourceItems.findIndex((i) => i.id === activeIssue.id);
    let targetIndex = targetItems.length;

    if (!BOARD_COLUMNS.some((c) => c.id === overId)) {
      targetIndex = targetItems.findIndex((i) => i.id === overId);
      if (targetIndex < 0) targetIndex = targetItems.length;
    }

    let nextIssues = [...issues];

    if (targetStatus === activeIssue.status) {
      const items = [...grouped[targetStatus]];
      const oldIndex = items.findIndex((i) => i.id === activeIssue.id);
      const newIndex = items.findIndex((i) => i.id === overId);

      if (newIndex >= 0) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        const updated = reordered.map((item, index) =>
          item.id === activeIssue.id ? { ...item, position: (index + 1) * 1000 } : item
        );
        nextIssues = issues.map((issue) => {
          const updatedItem = updated.find((u) => u.id === issue.id);
          return updatedItem ?? issue;
        });
        setIssues(nextIssues);
        await persistMove(activeIssue.id, targetStatus, (newIndex + 1) * 1000);
        return;
      }
    }

    const movedIssue: UnifiedIssue = {
      ...activeIssue,
      status: targetStatus,
      position: getNewPosition(targetItems, targetIndex)
    };

    nextIssues = issues.map((issue) => (issue.id === activeIssue.id ? movedIssue : issue));
    setIssues(nextIssues);
    await persistMove(activeIssue.id, movedIssue.status, movedIssue.position);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Unified Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag issues across columns. Changes sync live.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-4 py-2 text-sm"
            onClick={refreshBoard}
            disabled={pending}
          >
            {pending ? "Refreshing..." : "Refresh"}
          </button>
          <CreateIssueDialog forgeId={forgeId} repos={repos} onCreated={refreshBoard} />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {BOARD_COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              id={column.id}
              title={column.title}
              issues={grouped[column.id]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeIssue ? <BoardCard issue={activeIssue} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
