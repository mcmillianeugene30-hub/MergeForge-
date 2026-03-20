create table if not exists public.builder_sessions (
  id uuid primary key default gen_random_uuid(),
  forge_id uuid not null references public.forges(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  target_stack jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'analyzing', 'planning', 'generating', 'completed', 'failed')),
  summary text,
  plan jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.builder_artifacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.builder_sessions(id) on delete cascade,
  path text not null,
  content text not null,
  artifact_type text not null default 'code'
    check (artifact_type in ('code', 'plan', 'schema', 'env', 'readme')),
  created_at timestamptz not null default now()
);

create table if not exists public.repo_analysis_cache (
  id uuid primary key default gen_random_uuid(),
  forge_id uuid not null references public.forges(id) on delete cascade,
  linked_repo_id uuid not null references public.linked_repos(id) on delete cascade,
  summary jsonb not null default '{}'::jsonb,
  file_map jsonb not null default '[]'::jsonb,
  dependencies jsonb not null default '[]'::jsonb,
  env_vars jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (forge_id, linked_repo_id)
);

create index if not exists idx_builder_sessions_forge_id
  on public.builder_sessions(forge_id);

create index if not exists idx_builder_artifacts_session_id
  on public.builder_artifacts(session_id);

create index if not exists idx_repo_analysis_cache_forge_id
  on public.repo_analysis_cache(forge_id);

alter table public.builder_sessions enable row level security;
alter table public.builder_artifacts enable row level security;
alter table public.repo_analysis_cache enable row level security;

create policy "builder_sessions_select_member"
on public.builder_sessions
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "builder_sessions_modify_member"
on public.builder_sessions
for all
to authenticated
using (public.is_forge_member(forge_id))
with check (public.is_forge_member(forge_id));

create policy "repo_analysis_cache_select_member"
on public.repo_analysis_cache
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "repo_analysis_cache_modify_member"
on public.repo_analysis_cache
for all
to authenticated
using (public.is_forge_member(forge_id))
with check (public.is_forge_member(forge_id));

create policy "builder_artifacts_select_member"
on public.builder_artifacts
for select
to authenticated
using (
  exists (
    select 1
    from public.builder_sessions bs
    where bs.id = session_id
      and public.is_forge_member(bs.forge_id)
  )
);

create policy "builder_artifacts_modify_member"
on public.builder_artifacts
for all
to authenticated
using (
  exists (
    select 1
    from public.builder_sessions bs
    where bs.id = session_id
      and public.is_forge_member(bs.forge_id)
  )
)
with check (
  exists (
    select 1
    from public.builder_sessions bs
    where bs.id = session_id
      and public.is_forge_member(bs.forge_id)
  )
);
