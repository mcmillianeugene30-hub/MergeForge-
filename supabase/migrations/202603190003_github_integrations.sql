create table if not exists public.github_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  github_user_id bigint,
  github_login text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.linked_repos (
  id uuid primary key default gen_random_uuid(),
  forge_id uuid not null references public.forges(id) on delete cascade,
  github_account_id uuid references public.github_accounts(id) on delete set null,
  github_repo_full_name text not null,
  github_repo_id bigint,
  default_branch text,
  private boolean default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (forge_id, github_repo_full_name)
);

create index if not exists idx_linked_repos_forge_id on public.linked_repos(forge_id);
create index if not exists idx_linked_repos_repo_full_name on public.linked_repos(github_repo_full_name);
