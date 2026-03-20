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
