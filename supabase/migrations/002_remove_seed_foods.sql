delete from public.foods
where source = 'seed';

alter table public.foods
  alter column source set default 'curated';

alter table public.foods
  drop constraint if exists foods_source_not_seed;

alter table public.foods
  add constraint foods_source_not_seed check (source <> 'seed');
