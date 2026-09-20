export type UserRole = 'student' | 'super_admin';
export type TeamStatus = 'forming' | 'open_for_members' | 'finalized' | 'incomplete';
export type JoinRequestStatus = 'pending' | 'accepted' | 'declined';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  full_name: string;
  email: string;
  roll_number: string | null;
  branch: string;
  year: string;
  phone_country_code: string;
  phone_number: string;
  gender: Gender;
  role: UserRole;
  onboarding_complete: boolean;
  team_id: string | null;
  created_at: string;
  last_read_announcements_at: string | null;
}

export interface Team {
  id: string;
  name: string;
  invite_code: string;
  leader_id: string;
  status: TeamStatus;
  open_slot_requirement: string | null;
  ps1_id: string | null;
  ps2_id: string | null;
  created_at: string;
}

export interface TeamJoinRequest {
  id: string;
  team_id: string;
  requester_id: string;
  status: JoinRequestStatus;
  created_at: string;
}

export interface Announcement {
  id: string;
  body: string;
  posted_by: string;
  created_at: string;
  admin_only?: boolean;
}

// Problem Statement (static JSON)
export interface ProblemStatement {
  id: string;
  title: string;
  organization: string;
  theme: string;
  category: 'Software' | 'Hardware';
  level1: {
    background: string;
    the_ask: string;
    real_struggle: string;
    expected_solution: string;
    key_points: string[];
  };
  level2: {
    innovation_scope: string;
    innovation_scope_score: number;
    invention_effort: string;
    invention_effort_score: number;
  };
}
