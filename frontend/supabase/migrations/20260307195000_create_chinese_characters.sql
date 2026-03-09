create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'character_type') then
    create type public.character_type as enum ('verb', 'noun', 'adjective', 'adverb', 'link');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'character_importance') then
    create type public.character_importance as enum ('high', 'medium', 'low');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'character_confidence') then
    create type public.character_confidence as enum ('high', 'low');
  end if;
end $$;

create table if not exists public.chinese_characters (
  id uuid primary key default gen_random_uuid(),
  character text not null,
  translation text,
  example text,
  added_at date,
  type public.character_type,
  importance public.character_importance,
  last_seen_at date,
  number_of_correct_answers integer not null default 0,
  level_of_confidence public.character_confidence not null default 'low',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chinese_characters_non_negative_answers
    check (number_of_correct_answers >= 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chinese_characters_set_updated_at on public.chinese_characters;
create trigger chinese_characters_set_updated_at
before update on public.chinese_characters
for each row execute function public.set_updated_at();

create index if not exists idx_chinese_characters_type
  on public.chinese_characters (type);

create index if not exists idx_chinese_characters_importance
  on public.chinese_characters (importance);

create index if not exists idx_chinese_characters_confidence_last_seen
  on public.chinese_characters (level_of_confidence, last_seen_at);

create index if not exists idx_chinese_characters_character
  on public.chinese_characters (character);

alter table public.chinese_characters enable row level security;

drop policy if exists "Allow authenticated select" on public.chinese_characters;
create policy "Allow authenticated select"
on public.chinese_characters
for select
to authenticated
using (true);

drop policy if exists "Allow authenticated insert" on public.chinese_characters;
create policy "Allow authenticated insert"
on public.chinese_characters
for insert
to authenticated
with check (true);

drop policy if exists "Allow authenticated update" on public.chinese_characters;
create policy "Allow authenticated update"
on public.chinese_characters
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Allow authenticated delete" on public.chinese_characters;
create policy "Allow authenticated delete"
on public.chinese_characters
for delete
to authenticated
using (true);
