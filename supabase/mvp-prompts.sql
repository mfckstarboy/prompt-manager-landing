create extension if not exists pgcrypto;

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  provider text null,
  provider_customer_id text null,
  provider_subscription_id text null,
  current_period_end timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_plan_check check (plan in ('free', 'premium')),
  constraint user_entitlements_status_check check (
    status in ('active', 'inactive', 'past_due', 'canceled', 'expired')
  )
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid null references public.categories(id) on delete set null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;
alter table public.categories enable row level security;
alter table public.prompts enable row level security;

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;

create policy "user_entitlements_select_own"
on public.user_entitlements
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "categories_select_own" on public.categories;
drop policy if exists "categories_insert_own" on public.categories;
drop policy if exists "categories_update_own" on public.categories;
drop policy if exists "categories_delete_own" on public.categories;

create policy "categories_select_own"
on public.categories
for select
to authenticated
using (auth.uid() = user_id);

create policy "categories_insert_own"
on public.categories
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "categories_update_own"
on public.categories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "categories_delete_own"
on public.categories
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "prompts_select_own" on public.prompts;
drop policy if exists "prompts_insert_own" on public.prompts;
drop policy if exists "prompts_update_own" on public.prompts;
drop policy if exists "prompts_delete_own" on public.prompts;

create policy "prompts_select_own"
on public.prompts
for select
to authenticated
using (auth.uid() = user_id);

create policy "prompts_insert_own"
on public.prompts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "prompts_update_own"
on public.prompts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "prompts_delete_own"
on public.prompts
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists prompts_user_id_idx on public.prompts(user_id);
create index if not exists prompts_category_id_idx on public.prompts(category_id);
create index if not exists user_entitlements_plan_status_idx
on public.user_entitlements(user_id, plan, status);

create or replace function public.is_premium_user(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_entitlements
    where user_id = check_user_id
      and plan = 'premium'
      and status = 'active'
      and (
        current_period_end is null
        or current_period_end > now()
      )
  );
$$;

create or replace function public.get_user_plan(check_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_premium_user(check_user_id) then 'premium'
    else 'free'
  end;
$$;

create or replace function public.enforce_prompt_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prompt_count integer;
begin
  if public.is_premium_user(new.user_id) then
    return new;
  end if;

  select count(*)
  into prompt_count
  from public.prompts
  where user_id = new.user_id;

  if prompt_count >= 30 then
    raise exception 'Free plan prompt limit reached'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_category_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  category_count integer;
begin
  if public.is_premium_user(new.user_id) then
    return new;
  end if;

  select count(*)
  into category_count
  from public.categories
  where user_id = new.user_id;

  if category_count >= 5 then
    raise exception 'Free plan category limit reached'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prompts_set_updated_at on public.prompts;
drop trigger if exists user_entitlements_set_updated_at on public.user_entitlements;
drop trigger if exists prompts_enforce_free_limit on public.prompts;
drop trigger if exists categories_enforce_free_limit on public.categories;

create trigger prompts_set_updated_at
before update on public.prompts
for each row
execute function public.set_updated_at();

create trigger user_entitlements_set_updated_at
before update on public.user_entitlements
for each row
execute function public.set_updated_at();

create trigger prompts_enforce_free_limit
before insert on public.prompts
for each row
execute function public.enforce_prompt_limit();

create trigger categories_enforce_free_limit
before insert on public.categories
for each row
execute function public.enforce_category_limit();
