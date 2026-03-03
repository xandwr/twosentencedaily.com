-- Daily prompts (one per day, generated deterministically but stored for FK reference)
create table daily_prompts (
  date date primary key,
  type text not null,
  keywords text[] not null,
  created_at timestamptz not null default now()
);

-- User submissions (one per user per day)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_date date not null references daily_prompts(date),
  sentence1 text not null check (char_length(sentence1) <= 150),
  sentence2 text not null check (char_length(sentence2) <= 150),
  score real,  -- eigenvector alignment score, computed async
  submitted_at timestamptz not null default now(),

  unique (user_id, prompt_date)
);

-- Index for leaderboard queries (top scores per day)
create index idx_submissions_date_score on submissions (prompt_date, score desc nulls last);

-- Index for user history
create index idx_submissions_user on submissions (user_id, prompt_date desc);

-- RLS
alter table daily_prompts enable row level security;
alter table submissions enable row level security;

-- Anyone can read prompts
create policy "prompts_read" on daily_prompts
  for select using (true);

-- Only server can insert prompts
create policy "prompts_insert" on daily_prompts
  for insert with check (false);

-- Users can read all submissions (leaderboard)
create policy "submissions_read" on submissions
  for select using (true);

-- Users can insert their own submission
create policy "submissions_insert" on submissions
  for insert with check (auth.uid() = user_id);

-- Users cannot update or delete submissions (one shot per day, no take-backs)
