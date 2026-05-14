-- Run this in your Supabase SQL editor

create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default 'sun',
  frequency text not null default 'daily',
  weekly_target int,
  specific_days text[],
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz default now()
);

create table public.checkins (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

alter table public.habits enable row level security;
alter table public.checkins enable row level security;

create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own checkins"
  on public.checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- If you already ran the old schema, use these migrations instead:
-- alter table public.habits add column if not exists sort_order int not null default 0;
-- alter table public.habits add column if not exists archived boolean not null default false;
