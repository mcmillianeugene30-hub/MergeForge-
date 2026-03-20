import { BoardStatus, UnifiedIssue } from "@/lib/types";

export function groupIssuesByStatus(issues: UnifiedIssue[]) {
  const grouped: Record<BoardStatus, UnifiedIssue[]> = {
    todo: [],
    "in-progress": [],
    review: [],
    done: []
  };

  for (const issue of issues) {
    grouped[issue.status].push(issue);
  }

  for (const key of Object.keys(grouped) as BoardStatus[]) {
    grouped[key] = grouped[key].sort((a, b) => Number(a.position) - Number(b.position));
  }

  return grouped;
}

export function getNewPosition(items: UnifiedIssue[], targetIndex: number) {
  if (items.length === 0) return 1000;

  const prev = items[targetIndex - 1];
  const next = items[targetIndex];

  if (!prev && next) return Number(next.position) / 2;
  if (prev && !next) return Number(prev.position) + 1000;
  if (prev && next) return (Number(prev.position) + Number(next.position)) / 2;

  return 1000;
}
