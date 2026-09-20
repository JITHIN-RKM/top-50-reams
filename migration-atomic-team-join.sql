-- SQL Migration: Add atomic_add_team_member RPC function
-- This function fixes a Time-Of-Check to Time-Of-Use (TOCTOU) race condition
-- where multiple users joining simultaneously could bypass the 6-member limit.

CREATE OR REPLACE FUNCTION atomic_add_team_member(p_team_id UUID, p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  -- Lock the team row to prevent concurrent joins from bypassing the count limit
  PERFORM 1 FROM teams WHERE id = p_team_id FOR UPDATE;
  
  -- Check the current number of members
  SELECT count(*) INTO v_count FROM users WHERE team_id = p_team_id;
  
  IF v_count >= 6 THEN
    RETURN FALSE;
  END IF;
  
  -- Add the user to the team
  UPDATE users SET team_id = p_team_id WHERE id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
