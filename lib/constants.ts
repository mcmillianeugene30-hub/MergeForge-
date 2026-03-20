import { BoardStatus } from "@/lib/types";

export const APP_NAME = "MergeForge";
export const APP_DESCRIPTION = "AI-powered multi-repo project management";

export const BOARD_COLUMNS: Array<{
  id: BoardStatus;
  title: string;
}> = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" }
];
