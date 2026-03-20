alter table public.profiles enable row level security;
alter table public.forges enable row level security;
alter table public.forge_members enable row level security;
alter table public.forge_milestones enable row level security;
alter table public.github_accounts enable row level security;
alter table public.linked_repos enable row level security;
alter table public.unified_issues enable row level security;
alter table public.pr_activity enable row level security;
alter table public.activity_events enable row level security;

create or replace function public.is_forge_member(target_forge_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.forge_members fm
    where fm.forge_id = target_forge_id
      and fm.user_id = auth.uid()
  );
$$;

create or replace function public.is_forge_owner(target_forge_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.forge_members fm
    where fm.forge_id = target_forge_id
      and fm.user_id = auth.uid()
      and fm.role = 'owner'
  );
$$;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "forges_select_member"
on public.forges
for select
to authenticated
using (public.is_forge_member(id));

create policy "forges_insert_owner"
on public.forges
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "forges_update_owner"
on public.forges
for update
to authenticated
using (public.is_forge_owner(id))
with check (public.is_forge_owner(id));

create policy "forge_members_select_member"
on public.forge_members
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "forge_members_insert_owner"
on public.forge_members
for insert
to authenticated
with check (public.is_forge_owner(forge_id) or user_id = auth.uid());

create policy "forge_members_update_owner"
on public.forge_members
for update
to authenticated
using (public.is_forge_owner(forge_id))
with check (public.is_forge_owner(forge_id));

create policy "forge_members_delete_owner"
on public.forge_members
for delete
to authenticated
using (public.is_forge_owner(forge_id));

create policy "forge_milestones_select_member"
on public.forge_milestones
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "forge_milestones_modify_member"
on public.forge_milestones
for all
to authenticated
using (public.is_forge_member(forge_id))
with check (public.is_forge_member(forge_id));

create policy "github_accounts_select_own"
on public.github_accounts
for select
to authenticated
using (user_id = auth.uid());

create policy "github_accounts_modify_own"
on public.github_accounts
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "linked_repos_select_member"
on public.linked_repos
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "linked_repos_modify_member"
on public.linked_repos
for all
to authenticated
using (public.is_forge_member(forge_id))
with check (public.is_forge_member(forge_id));

create policy "unified_issues_select_member"
on public.unified_issues
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "unified_issues_modify_member"
on public.unified_issues
for all
to authenticated
using (public.is_forge_member(forge_id))
with check (public.is_forge_member(forge_id));

create policy "pr_activity_select_member"
on public.pr_activity
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "pr_activity_modify_member"
on public.pr_activity
for all
to authenticated
using (public.is_forge_member(forge_id))
with check (public.is_forge_member(forge_id));

create policy "activity_events_select_member"
on public.activity_events
for select
to authenticated
using (public.is_forge_member(forge_id));

create policy "activity_events_modify_member"
on public.activity_events
for all
to authenticated
using (public.is_forge_member(forge_id))
with check (public.is_forge_member(forge_id));
