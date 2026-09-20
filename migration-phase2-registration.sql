-- =============================================================
-- Phase 2 Registration & Storage — Database Migration
-- Copy and paste this into the Supabase SQL Editor and click "Run"
-- URL: https://supabase.com/dashboard/project/uvxdzzbhqxqbddakbstq/sql/new
-- =============================================================

-- 1. CREATE PHASE 2 REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.phase2_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  registered_by TEXT NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_team_phase2 UNIQUE (team_id)
);

-- 2. CREATE INDEXES FOR FAST LOOKUPS
CREATE INDEX IF NOT EXISTS idx_phase2_team_id ON public.phase2_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_phase2_registered_by ON public.phase2_registrations(registered_by);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.phase2_registrations ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Anyone authenticated can view registered Phase 2 teams
DROP POLICY IF EXISTS "Authenticated users can read phase2 registrations" ON public.phase2_registrations;
CREATE POLICY "Authenticated users can read phase2 registrations"
  ON public.phase2_registrations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Team leaders can register their team for Phase 2
DROP POLICY IF EXISTS "Team leaders can register for phase2" ON public.phase2_registrations;
CREATE POLICY "Team leaders can register for phase2"
  ON public.phase2_registrations FOR INSERT
  WITH CHECK (
    registered_by = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.leader_id = auth.uid()::text
    )
  );

-- Service role / admins can manage all rows
DROP POLICY IF EXISTS "Admins can manage phase2 registrations" ON public.phase2_registrations;
CREATE POLICY "Admins can manage phase2 registrations"
  ON public.phase2_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text AND u.role = 'super_admin'
    )
  );

-- 5. PUBLIC STORAGE BUCKET FOR PHASE 2 PDFS
INSERT INTO storage.buckets (id, name, public)
VALUES ('phase2_pdfs', 'phase2_pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for phase2_pdfs
DROP POLICY IF EXISTS "Public can view Phase 2 PDFs" ON storage.objects;
CREATE POLICY "Public can view Phase 2 PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'phase2_pdfs');

DROP POLICY IF EXISTS "Authenticated users can upload Phase 2 PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can upload Phase 2 PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'phase2_pdfs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update Phase 2 PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can update Phase 2 PDFs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'phase2_pdfs' AND auth.role() = 'authenticated');
