create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  age integer,
  sex text check (sex in ('male', 'female')),
  height_cm numeric,
  weight_kg numeric,
  goal text check (goal in ('maintain', 'lose', 'gain_slow', 'gain_fast')),
  activity text check (activity in ('low', 'medium', 'high')),
  target_kcal numeric not null default 2850,
  target_protein_g numeric not null default 160,
  target_carbs_g numeric not null default 385,
  target_fat_g numeric not null default 75,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_es text not null,
  source text not null default 'seed',
  kcal_per_100g numeric not null check (kcal_per_100g >= 0),
  protein_per_100g numeric not null check (protein_per_100g >= 0),
  carbs_per_100g numeric not null check (carbs_per_100g >= 0),
  fat_per_100g numeric not null check (fat_per_100g >= 0),
  fiber_per_100g numeric check (fiber_per_100g >= 0),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.branded_products (
  id uuid primary key default gen_random_uuid(),
  barcode text not null unique,
  brand text,
  product_name text not null,
  kcal_per_100g numeric not null check (kcal_per_100g >= 0),
  protein_per_100g numeric not null check (protein_per_100g >= 0),
  carbs_per_100g numeric not null check (carbs_per_100g >= 0),
  fat_per_100g numeric not null check (fat_per_100g >= 0),
  fiber_per_100g numeric check (fiber_per_100g >= 0),
  serving_size_g numeric check (serving_size_g > 0),
  source text not null default 'open_food_facts',
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'snack', 'dinner')),
  title text not null default 'Comida',
  date date not null,
  total_kcal numeric not null default 0,
  total_protein_g numeric not null default 0,
  total_carbs_g numeric not null default 0,
  total_fat_g numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  food_id uuid references public.foods(id) on delete set null,
  product_id uuid references public.branded_products(id) on delete set null,
  name text not null,
  grams numeric not null check (grams > 0),
  kcal numeric not null check (kcal >= 0),
  protein_g numeric not null check (protein_g >= 0),
  carbs_g numeric not null check (carbs_g >= 0),
  fat_g numeric not null check (fat_g >= 0),
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  source text not null check (source in ('photo_ai', 'barcode', 'manual', 'search')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_item_id uuid references public.meal_items(id) on delete set null,
  original_prediction jsonb not null,
  corrected_food text not null,
  corrected_grams numeric not null check (corrected_grams > 0),
  photo_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_code text not null,
  parsed_type text not null,
  barcode text,
  created_at timestamptz not null default now()
);

create index if not exists foods_name_es_idx on public.foods using gin (to_tsvector('spanish', name_es));
create index if not exists foods_name_idx on public.foods using gin (to_tsvector('simple', name));
create index if not exists meals_user_date_idx on public.meals (user_id, date desc);
create index if not exists meal_items_meal_id_idx on public.meal_items (meal_id);
create index if not exists user_corrections_user_id_idx on public.user_corrections (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.foods enable row level security;
alter table public.branded_products enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.user_corrections enable row level security;
alter table public.scan_history enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "foods readable by authenticated users" on public.foods for select to authenticated using (true);
create policy "branded products readable by authenticated users" on public.branded_products for select to authenticated using (true);
create policy "branded products insert by authenticated users" on public.branded_products for insert to authenticated with check (true);
create policy "branded products update by authenticated users" on public.branded_products for update to authenticated using (true) with check (true);

create policy "meals select own" on public.meals for select using (auth.uid() = user_id);
create policy "meals insert own" on public.meals for insert with check (auth.uid() = user_id);
create policy "meals update own" on public.meals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals delete own" on public.meals for delete using (auth.uid() = user_id);

create policy "meal items select own" on public.meal_items
  for select using (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id and meals.user_id = auth.uid()
  ));

create policy "meal items insert own" on public.meal_items
  for insert with check (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id and meals.user_id = auth.uid()
  ));

create policy "meal items update own" on public.meal_items
  for update using (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id and meals.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id and meals.user_id = auth.uid()
  ));

create policy "meal items delete own" on public.meal_items
  for delete using (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id and meals.user_id = auth.uid()
  ));

create policy "corrections select own" on public.user_corrections for select using (auth.uid() = user_id);
create policy "corrections insert own" on public.user_corrections for insert with check (auth.uid() = user_id);

create policy "scan history select own" on public.scan_history for select using (auth.uid() = user_id);
create policy "scan history insert own" on public.scan_history for insert with check (auth.uid() = user_id);

insert into public.foods
  (name, name_es, source, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, verified)
values
  ('cooked white rice', 'Arroz blanco cocido', 'seed', 130, 2.7, 28, 0.3, null, true),
  ('grilled chicken breast', 'Pechuga de pollo a la plancha', 'seed', 165, 31, 0, 3.6, null, true),
  ('olive oil', 'Aceite de oliva', 'seed', 884, 0, 0, 100, null, true),
  ('banana', 'Platano', 'seed', 89, 1.1, 22.8, 0.3, 2.6, true),
  ('egg', 'Huevo', 'seed', 143, 12.6, 0.7, 9.5, null, true),
  ('greek yogurt', 'Yogur griego natural', 'seed', 125, 8, 4, 8, null, true),
  ('white bread', 'Pan blanco', 'seed', 265, 9, 49, 3.2, null, true),
  ('cooked pasta', 'Pasta cocida', 'seed', 158, 5.8, 30.9, 0.9, null, true),
  ('salmon', 'Salmon', 'seed', 208, 20.4, 0, 13.4, null, true),
  ('boiled potato', 'Patata cocida', 'seed', 87, 1.9, 20.1, 0.1, 1.8, true)
on conflict do nothing;
