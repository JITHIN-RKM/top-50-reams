# Phase 5: Super Admin Panel Spec

## Objectives
1. Role-Gated Admin Route (`/admin`):
   - Protected by Next.js middleware and Supabase RLS.
   - User must have `role === 'super_admin'` in `users` table.
   - Unauthorized attempts automatically redirect to `/dashboard` with an access denied warning.
2. Required Dashboard Metrics (confirmed in PRD):
   - **Teams Formed**: Total count of all teams.
   - **Teams Half-Filled**: Count of teams with 1 to 5 members.
   - **Teams Fully Filled**: Count of teams with exactly 6 members.
   - **Free Agents**: Count of onboarded students with no team (`team_id IS NULL`).
   - **Total Registrations**: Count of all onboarded students.
3. Live Announcement Broadcasting System:
   - Form to compose a new announcement (`body`, `posted_by`).
   - Inserts row into `announcements` table.
   - Instantly updates the Announcement feed on students' `/dashboard`.
4. Team Oversight Table:
   - Lists all teams with:
     - Team Name & Leader Name
     - Member count (Total / 6, and Female member count)
     - Diversity Status (Pass / Fail pill)
     - Team Status (Forming, Open for Members, Finalized, Incomplete)
     - Selected Problem Statement ID (or "Not Selected")
     - Open Slot requirement note (if any)
5. Student Registry Table:
   - Lists all registered participants:
     - Full Name & Email
     - Roll Number, Branch, Year
     - Phone Number
     - Gender
     - Assigned Team Name (or "Solo / Free Agent")
     - Registration timestamp
6. Supabase Direct Access Guidance:
   - Note for the core organizing team that any raw export or advanced schema management can be accessed directly on the Supabase project dashboard.

## Verification Criteria
- [ ] Non-admin users are strictly blocked from `/admin`.
- [ ] Admin metrics accurately reflect live database state.
- [ ] Super Admin can post announcements and verify they appear on the student dashboard.
- [ ] Super Admin can inspect full team diversity status and student rosters.
