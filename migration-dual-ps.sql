-- Add new columns for dual Problem Statements
ALTER TABLE public.teams 
ADD COLUMN ps1_id text NULL,
ADD COLUMN ps2_id text NULL;

-- Migrate existing data
UPDATE public.teams 
SET ps1_id = problem_statement_id 
WHERE problem_statement_id IS NOT NULL;

-- Drop old column
ALTER TABLE public.teams 
DROP COLUMN problem_statement_id;
