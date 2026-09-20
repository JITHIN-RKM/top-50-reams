# Build Roadmap — SIH 2026 OUCE Hackathon Platform

## Milestones & Phased Execution

### Phase 1: Auth & Onboarding Gate
- Setup Next.js 15+ App Router, Tailwind CSS, TypeScript, and Lucide icons.
- Configure Clerk Auth for Google OAuth Only (social login only).
- Setup Supabase Database client, Schema definition, and RLS policies for `users` table.
- Create `/sign-in` page and `/onboarding` form (Google email read-only, branch/year dropdowns, phone country code default +91, gender required, optional roll number).
- Implement auth and onboarding route middleware.
- **Verification:** User signs in via Google, gets gated to `/onboarding`, submits valid profile, data saved to Supabase, unlocks `/dashboard`.

### Phase 2: Team Formation, Invite Code & Rule Validator
- Setup DB tables `teams` and `team_join_requests` with RLS.
- Create Team: Server Action generates unique 6-character invite code (retry loop), assigns user as leader.
- Join via Code: Direct add by entering 6-char code.
- Open Slot Board: Leader can flag "Need: Female Member" or custom requirement -> appears on public "Looking for Members" board.
- Request to Join & Leader Approval: Free agent submits join request -> Leader gets approval notification/UI -> Leader accepts/declines.
- SIH Rule Validator Engine: Live calculation of Size (6/6) and Gender Diversity (>=1 female member).
- Team finalization logic + PS selection unlock.
- Auto-tagging of incomplete teams past deadline with member unlock/leave capabilities.
- **Verification:** 6-member team formation flow tested across code join and request-to-join; rule validator correctly shifts from Red to Green and unlocks PS selection.

### Phase 3: Unified Dashboard Shell (5 Tabs)
- Persistent Team Header: Team status badge, member count `x/6`, member avatars with gender indicators, or "No team" prompt with quick actions.
- Profile completeness widget.
- Horizontal Swipeable Tab Bar (**5 tabs**, not 4):
  - **Roadmap Tab**: Vertical milestone stepper (Registration -> Formation -> PS Selection -> Hackathon Day).
  - **Team Management Tab**: Contextual states (Solo, Forming, Finalized, Incomplete) + Open Slots Board.
  - **PS Explorer Tab**: Full Problem Statement Explorer embedded as a dashboard tab. Search, 5 filters, sort, card listing, "Load 25 More", inline detail panel with Overview + Analysis tabs. Browsing freely accessible to ALL students regardless of team status. "Select PS" action gated to finalized teams only.
  - **Resources Tab**: SIH Guidelines, OUCE PPT Templates, Evaluation Rubric, Official links.
  - **Announcements Tab**: Reverse-chronological broadcast feed.
- **Verification:** Seamless switching between 5 tabs, mobile-first responsive layout, reactive team state changes, PS browsing works for all users.

### Phase 4: Problem Statement Data & Content
- Static frontend dataset `sih-2026-data.json` with 15-20 100% independently rewritten problem statements.
- The PS Explorer UI is already built in Phase 3 as a dashboard tab.
- Populate the JSON with full Level 1 (Overview) and Level 2 (Analysis) content across Agriculture, Healthcare, Clean Energy, Smart Education, Cybersecurity, Transport, AI/Robotics themes.
- Wire the "Select PS" action to persist `problem_statement_id` to Supabase `teams` table for finalized teams.
- **Verification:** Instant client-side search/filtering without DB overhead, detail rendering, and selection persistence.

### Phase 5: Super Admin Panel
- Role-gated route `/admin` (accessible only to `super_admin`).
- Real-time aggregate statistics: Total teams formed, Half-filled teams, Fully filled teams, Free agents count, Registered students count.
- Announcement Composer: Post announcements to the student dashboard live feed.
- Team Oversight & Diversity Table: Team status, roster breakdown, diversity pass/fail, selected PS.
- Registered Students Registry: Profile details, branch/year, timestamps.
- **Verification:** Admin metrics accurately reflect DB state; unauthorized access is blocked at middleware and RLS layers.
