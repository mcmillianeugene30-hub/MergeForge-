create table if not exists public.unified_issues (
  id uuid primary key default gen_random_uuid(),
  forge_id uuid not null references public.forges(id) on delete cascade,
  source_repo_id uuid references public.linked_repos(id) on delete set null,
  github_issue_number integer,
  title text not null,
  body text,
  status text not null default 'todo' check (status in ('todo', 'in-progress', 'review', 'done')),
  labels text[] not null default '{}',
  assignee_ids uuid[] not null default '{}',
  milestone text,
  linked_pr_url text,
  github_issue_url text,
  source_type text not null default 'github' check (source_type in ('github', 'virtual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pr_activity (
  id uuid primary key default gen_random_uuid(),
  forge_id uuid not null references public.forges(id) on delete cascade,
  repo_id uuid references public.linked_repos(id) on delete set null,
  pr_number integer not null,
  title text not null,
  state text not null,
  author text,
  pr_url text,
  related_issue_numbers integer[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  forge_id uuid not null references public.forges(id) on delete cascade,
  repo_id uuid references public.linked_repos(id) on delete set null,
  event_type text not null check (event_type in ('issue', 'pr', 'commit', 'comment', 'sync')),
  title text not null,
  body text,
  actor text,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_unified_issues_forge_id on public.unified_issues(forge_id);
create index if not exists idx_unified_issues_source_repo_id on public.unified_issues(source_repo_id);
create index if not exists idx_pr_activity_forge_id on public.pr_activity(forge_id);
create index if not exists idx_activity_events_forge_id on public.activity_events(forge_id);
create index if not exists idx_activity_events_created_at on public.activity_events(created_at desc);
