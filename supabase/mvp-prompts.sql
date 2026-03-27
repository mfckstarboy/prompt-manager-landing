create extension if not exists pgcrypto;

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

alter table public.categories enable row level security;
alter table public.prompts enable row level security;

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

create trigger prompts_set_updated_at
before update on public.prompts
for each row
execute function public.set_updated_at();
