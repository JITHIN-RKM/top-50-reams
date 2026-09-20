-- =============================================================
-- Phase 1 Registration — Database Migration
-- Run this in the Supabase SQL Editor
-- =============================================================

-- 1. PHASE 1 REGISTRATIONS TABLE
-- Tracks which teams have registered for Phase 1
create table if not exists public.phase1_registrations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  registered_by text not null references public.users(id),
  created_at timestamptz not null default now(),
  constraint unique_team_phase1 unique (team_id)
);

-- Enable RLS
alter table public.phase1_registrations enable row level security;

-- All authenticated users can read phase1 registrations
create policy "Authenticated users can read phase1 registrations"
  on public.phase1_registrations for select
  using (auth.uid() is not null);

-- Team leaders can register their team for phase 1
create policy "Team leaders can register for phase1"
  on public.phase1_registrations for insert
  with check (
    registered_by = auth.uid()::text
    and exists (
      select 1 from public.teams t
      where t.id = team_id and t.leader_id = auth.uid()::text
    )
  );

-- =============================================================
-- 2. STORAGE BUCKET for Phase 1 PDFs
-- Run this separately if needed, or create via Supabase Dashboard
-- =============================================================
-- insert into storage.buckets (id, name, public)
-- values ('phase1_pdfs', 'phase1_pdfs', true)
-- on conflict (id) do nothing;

-- NOTE: Create the 'phase1_pdfs' bucket manually in the Supabase
-- Dashboard → Storage → New Bucket → Name: phase1_pdfs → Public: ON
