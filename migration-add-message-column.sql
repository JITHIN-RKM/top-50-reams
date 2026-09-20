-- Run this in your Supabase SQL Editor to add the message column for student pitches
ALTER TABLE team_join_requests ADD COLUMN IF NOT EXISTS message text;