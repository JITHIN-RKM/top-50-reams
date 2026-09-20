# Phase 2: Team Formation, Invite Code & Rule Validator Spec

## Objectives
1. Database Schema & RLS for Teams & Requests:
   - `teams` table:
     - `id` (uuid, PK)
     - `name` (text, unique, required)
     - `invite_code` (text, unique, 6 chars alphanumeric)
     - `leader_id` (uuid, FK -> users.id)
     - `status` (enum: 'forming', 'open_for_members', 'finalized', 'incomplete')
     - `open_slot_requirement` (text, nullable, e.g. "Need: Female Member", "Need: 1 more member")
     - `problem_statement_id` (text, nullable, references static JSON id)
     - `created_at` (timestamp)
   - `team_join_requests` table:
     - `id` (uuid, PK)
     - `team_id` (uuid, FK -> teams.id)
     - `requester_id` (uuid, FK -> users.id)
     - `status` (enum: 'pending', 'accepted', 'declined')
     - `created_at` (timestamp)
2. Core Server Actions & Logic:
   - `createTeam(name)`: Generates a cryptographically random, collision-safe 6-character uppercase alphanumeric invite code, creates the team with leader = current user, sets current user's `team_id`, returns team object.
   - `joinTeamByCode(code)`: Validates invite code, verifies team has < 6 members, adds user to team, clears any pending join requests.
   - `openSlot(requirementTag)`: Leader only; updates `open_slot_requirement` and sets team status to `open_for_members`.
   - `closeSlot()`: Leader only; removes open slot requirement and reverts status to `forming`.
   - `requestToJoin(teamId)`: Free agent creates a join request for an open team.
   - `respondToJoinRequest(requestId, status)`: Leader only; accepts or declines request. If accepted, checks team size < 6, updates requester `team_id` and marks request accepted.
   - `leaveTeam()`: Student leaves current team (if leader, transfers leadership to another member or deletes team if 0 members). Incomplete teams past deadline allow easy exit.
3. SIH Rule Validator Engine:
   - Dynamic live evaluation of:
     - Team Size: `count(members) == 6` (Red until 6/6, then Green)
     - Gender Diversity: `count(female_members) >= 1` (Red until >= 1, then Green)
     - Problem Statement: Locked/Greyed out until Size & Diversity both pass.
   - When both pass, status automatically updates to `finalized` and unlocks "Team Finalized: Choose Problem Statement" action.
4. Open Slot Board ("Looking for Members"):
   - Displays all teams with `status = 'open_for_members'`.
   - Cards display team name, current member count, tagged requirement (e.g. "Need: Female Member"), leader name, and a "Request to Join" button.

## Verification Criteria
- [ ] Team creator gets a unique 6-character invite code.
- [ ] Friends can join instantly via code without leader approval.
- [ ] Free agents can view the Open Slot board and submit a Join Request.
- [ ] Leader can accept/decline join requests in real time.
- [ ] Rule Validator displays exact live status for size and female member presence.
- [ ] Finalized state unlocks only when both size=6 and female>=1 are satisfied.
