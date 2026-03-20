"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { UnifiedIssue } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BoardCard({ issue }: { issue: UnifiedIssue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: issue.id,
    data: {
      type: "issue",
      issue
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-2xl border bg-card p-3 shadow-sm transition",
        isDragging && "opacity-60"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="line-clamp-2 font-medium">{issue.title}</div>
        <Badge variant="secondary">{issue.source_type}</Badge>
      </div>

      {issue.body ? (
        <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
          {issue.body}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {issue.source_repo_name ? (
          <Badge variant="outline">{issue.source_repo_name}</Badge>
        ) : null}

        {issue.github_issue_number ? (
          <Badge variant="outline">#{issue.github_issue_number}</Badge>
        ) : null}

        {issue.labels?.slice(0, 3).map((label) => (
          <Badge key={label} variant="secondary">
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
