export type Forge = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  status: "active" | "archived";
  created_at: string;
};

export type ForgeMember = {
  id: string;
  forge_id: string;
  user_id: string;
  role: "owner" | "admin" | "editor" | "viewer";
  joined_at: string;
};

export type LinkedRepo = {
  id: string;
  forge_id: string;
  github_repo_full_name: string;
  github_repo_id: number | null;
  default_branch: string | null;
  private: boolean | null;
  last_synced_at: string | null;
};

export type BoardStatus = "todo" | "in-progress" | "review" | "done";

export type UnifiedIssue = {
  id: string;
  forge_id: string;
  source_repo_id: string | null;
  github_issue_number: number | null;
  title: string;
  body: string | null;
  status: BoardStatus;
  labels: string[];
  assignee_ids: string[];
  milestone: string | null;
  linked_pr_url: string | null;
  github_issue_url: string | null;
  source_type: "github" | "virtual";
  source_repo_name?: string | null;
  issue_type?: "issue" | "task" | "bug" | "feature";
  position: number;
  created_at: string;
  updated_at: string;
};

export type ActivityEvent = {
  id: string;
  forge_id: string;
  repo_id: string | null;
  event_type: string;
  title: string;
  actor: string | null;
  source_url: string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
};

export type BuilderStatus =
  | "draft"
  | "analyzing"
  | "planning"
  | "generating"
  | "completed"
  | "failed";

export type TargetStack = {
  frontend: string;
  backend: string;
  styling: string;
  auth?: string;
  database?: string;
};

export type RepoAnalysisSummary = {
  repo: string;
  stack: string[];
  dependencies: string[];
  envVars: string[];
  services: string[];
  routes: string[];
  dbModels: string[];
  notes: string[];
};

export type ForgeKnowledge = {
  repos: RepoAnalysisSummary[];
  sharedConcepts: string[];
  conflicts: string[];
  opportunities: string[];
};

export type BuilderPlan = {
  summary: string;
  architecture: {
    frontend: string[];
    backend: string[];
    database: string[];
    integrations: string[];
  };
  pages: Array<{
    path: string;
    title: string;
    purpose: string;
  }>;
  routes: Array<{
    path: string;
    method: string;
    purpose: string;
  }>;
  schema: Array<{
    table: string;
    columns: string[];
  }>;
  env_vars: string[];
  tasks: string[];
};

export type BuilderArtifact = {
  id: string;
  session_id: string;
  path: string;
  content: string;
  artifact_type: "code" | "plan" | "schema" | "env" | "readme";
  created_at: string;
};
