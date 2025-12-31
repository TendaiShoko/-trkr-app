-- TRKR Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Workouts table
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  sport text not null check (sport in ('swim', 'bike', 'run', 'strength', 'other')),
  name text,
  duration_minutes integer not null,
  distance numeric,
  environment text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Food entries table
create table public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  meal text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  quantity numeric default 1,
  unit text default 'serving',
  notes text,
  created_at timestamp with time zone default now()
);

-- Weight entries table
create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  weight_kg numeric not null,
  notes text,
  created_at timestamp with time zone default now()
);

-- User profiles table (optional, for additional user data)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  daily_calorie_target integer default 2000,
  protein_target integer default 150,
  carbs_target integer default 250,
  fat_target integer default 65,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security on all tables
alter table public.workouts enable row level security;
alter table public.food_entries enable row level security;
alter table public.weight_entries enable row level security;
alter table public.profiles enable row level security;

-- RLS Policies: Users can only access their own data

-- Workouts policies
create policy "Users can view own workouts" on public.workouts
  for select using (auth.uid() = user_id);

create policy "Users can insert own workouts" on public.workouts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own workouts" on public.workouts
  for update using (auth.uid() = user_id);

create policy "Users can delete own workouts" on public.workouts
  for delete using (auth.uid() = user_id);

-- Food entries policies
create policy "Users can view own food entries" on public.food_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own food entries" on public.food_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own food entries" on public.food_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own food entries" on public.food_entries
  for delete using (auth.uid() = user_id);

-- Weight entries policies
create policy "Users can view own weight entries" on public.weight_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own weight entries" on public.weight_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own weight entries" on public.weight_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own weight entries" on public.weight_entries
  for delete using (auth.uid() = user_id);

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create indexes for better query performance
create index workouts_user_date_idx on public.workouts(user_id, date);
create index food_entries_user_date_idx on public.food_entries(user_id, date);
create index weight_entries_user_date_idx on public.weight_entries(user_id, date);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
