-- Bidou : tables et règles d'accès. À coller une seule fois dans Supabase → SQL Editor → Run.

-- 1. Les données de chaque personne (goûts, semaine, courses, carnet) dans une seule ligne.
create table if not exists public.bidou_data (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  d jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.bidou_data enable row level security;

drop policy if exists "bidou_data lecture" on public.bidou_data;
drop policy if exists "bidou_data ajout" on public.bidou_data;
drop policy if exists "bidou_data modif" on public.bidou_data;
drop policy if exists "bidou_data suppression" on public.bidou_data;
create policy "bidou_data lecture" on public.bidou_data for select to authenticated using (auth.uid() = user_id);
create policy "bidou_data ajout" on public.bidou_data for insert to authenticated with check (auth.uid() = user_id);
create policy "bidou_data modif" on public.bidou_data for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "bidou_data suppression" on public.bidou_data for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.bidou_data to authenticated;
revoke all on public.bidou_data from anon;
-- Taille maximale des données d'une personne (2 Mo), pour qu'un compte ne puisse pas remplir la base.
alter table public.bidou_data drop constraint if exists bidou_data_taille;
alter table public.bidou_data add constraint bidou_data_taille check (pg_column_size(d) < 2000000);

-- 2. Compteur d'appels à Claude par personne et par jour (limite la dépense sur ta clé).
create table if not exists public.bidou_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  n int not null default 0,
  primary key (user_id, day)
);
alter table public.bidou_usage enable row level security;
drop policy if exists "bidou_usage lecture" on public.bidou_usage;
create policy "bidou_usage lecture" on public.bidou_usage for select to authenticated using (auth.uid() = user_id);
grant select on public.bidou_usage to authenticated;
revoke all on public.bidou_usage from anon;

create or replace function public.bidou_bump_usage()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare c int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.bidou_usage (user_id, day, n)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set n = public.bidou_usage.n + 1
  returning n into c;
  return c;
end;
$$;
revoke all on function public.bidou_bump_usage() from public, anon;
grant execute on function public.bidou_bump_usage() to authenticated;
