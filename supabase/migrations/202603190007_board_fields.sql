alter table public.unified_issues
  add column if not exists position numeric not null default 1000,
  add column if not exists source_repo_name text,
  add column if not exists issue_type text not null default 'issue' check (issue_type in ('issue', 'task', 'bug', 'feature')),
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists idx_unified_issues_forge_status_position
  on public.unified_issues(forge_id, status, position);

alter table public.pr_activity
  add column if not exists mergeable_state text,
  add column if not exists head_ref text,
  add column if not exists base_ref text;
