create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.forge_members (
  forge_id uuid not null references public.forges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (forge_id, user_id)
);

create table if not exists public.forge_milestones (
  id uuid primary key default gen_random_uuid(),
  forge_id uuid not null references public.forges(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists idx_forges_owner_id on public.forges(owner_id);
create index if not exists idx_forge_members_user_id on public.forge_members(user_id);
create index if not exists idx_forge_milestones_forge_id on public.forge_milestones(forge_id);
