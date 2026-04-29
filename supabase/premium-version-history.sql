create extension if not exists pgcrypto;

create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  created_from text not null default 'edit',
  constraint prompt_versions_created_from_check check (created_from in ('edit', 'restore')),
  constraint prompt_versions_content_check check (nullif(trim(content), '') is not null)
);

alter table public.prompt_versions enable row level security;

create index if not exists prompt_versions_user_prompt_created_idx
on public.prompt_versions(user_id, prompt_id, created_at desc);

create index if not exists prompt_versions_user_created_idx
on public.prompt_versions(user_id, created_at);

drop policy if exists "prompt_versions_select_active_premium_own" on public.prompt_versions;

create policy "prompt_versions_select_active_premium_own"
on public.prompt_versions
for select
to authenticated
using (
  auth.uid() = user_id
  and public.is_premium_user(auth.uid())
);

create or replace function public.prune_prompt_versions(check_prompt_id uuid, check_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.prompt_versions
  where id in (
    select id
    from (
      select
        id,
        row_number() over (partition by prompt_id order by created_at desc, id desc) as version_rank
      from public.prompt_versions
      where prompt_id = check_prompt_id
        and user_id = check_user_id
    ) ranked_versions
    where version_rank > 20
  );
$$;

create or replace function public.create_prompt_version(
  check_prompt_id uuid,
  version_title text,
  version_content text,
  version_source text default 'edit'
)
returns public.prompt_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  owned_prompt public.prompts%rowtype;
  inserted_version public.prompt_versions%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if not public.is_premium_user(current_user_id) then
    raise exception 'Version history is locked'
      using errcode = 'P0001';
  end if;

  if version_source not in ('edit', 'restore') then
    raise exception 'Invalid version source'
      using errcode = 'P0001';
  end if;

  if nullif(trim(coalesce(version_content, '')), '') is null then
    raise exception 'Version content cannot be empty'
      using errcode = 'P0001';
  end if;

  select *
  into owned_prompt
  from public.prompts
  where id = check_prompt_id
    and user_id = current_user_id;

  if not found then
    raise exception 'Prompt not found'
      using errcode = 'P0001';
  end if;

  insert into public.prompt_versions (
    prompt_id,
    user_id,
    title,
    content,
    created_from
  )
  values (
    owned_prompt.id,
    current_user_id,
    coalesce(nullif(trim(version_title), ''), owned_prompt.title, 'Untitled prompt'),
    trim(version_content),
    version_source
  )
  returning * into inserted_version;

  perform public.prune_prompt_versions(owned_prompt.id, current_user_id);

  return inserted_version;
end;
$$;

create or replace function public.restore_prompt_version(check_version_id uuid)
returns public.prompts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_version public.prompt_versions%rowtype;
  current_prompt public.prompts%rowtype;
  restored_prompt public.prompts%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = 'P0001';
  end if;

  if not public.is_premium_user(current_user_id) then
    raise exception 'Version history is locked'
      using errcode = 'P0001';
  end if;

  select *
  into selected_version
  from public.prompt_versions
  where id = check_version_id
    and user_id = current_user_id;

  if not found then
    raise exception 'Version not found'
      using errcode = 'P0001';
  end if;

  select *
  into current_prompt
  from public.prompts
  where id = selected_version.prompt_id
    and user_id = current_user_id;

  if not found then
    raise exception 'Prompt not found'
      using errcode = 'P0001';
  end if;

  if current_prompt.content is distinct from selected_version.content
    or current_prompt.title is distinct from selected_version.title then
    perform public.create_prompt_version(
      current_prompt.id,
      current_prompt.title,
      current_prompt.content,
      'restore'
    );
  end if;

  update public.prompts
  set
    title = selected_version.title,
    content = selected_version.content,
    updated_at = now()
  where id = current_prompt.id
    and user_id = current_user_id
  returning * into restored_prompt;

  perform public.prune_prompt_versions(current_prompt.id, current_user_id);

  return restored_prompt;
end;
$$;

create or replace function public.delete_inactive_prompt_versions_older_than_90_days()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.prompt_versions pv
  where pv.created_at < now() - interval '90 days'
    and not public.is_premium_user(pv.user_id);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke execute on function public.prune_prompt_versions(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.create_prompt_version(uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public.restore_prompt_version(uuid) from public, anon, authenticated;
revoke execute on function public.delete_inactive_prompt_versions_older_than_90_days() from public, anon, authenticated;

grant execute on function public.create_prompt_version(uuid, text, text, text) to authenticated;
grant execute on function public.restore_prompt_version(uuid) to authenticated;
