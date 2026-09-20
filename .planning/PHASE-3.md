# Phase 3: Unified Dashboard Shell Spec

## Objectives
1. Single Mega-Dashboard Architecture (`/dashboard`):
   - No multi-page maze; everything central to student hackathon participation lives on one page.
   - **5 tabs** (not 4): Roadmap, Team Management, PS Explorer, Resources, Announcements.
2. Persistent Top Context Header:
   - If user is in a team:
     - Prominent Team Card with Team Name, member badges (initials, gender tag, leader crown icon).
     - Live Member Count (e.g. "4/6 Members").
     - Current Status Pill (Forming / Open for Members / Finalized / Incomplete).
   - If user has no team:
     - Clean "Free Agent" prompt card: "You don't have a team yet."
     - Instant CTAs: "Create Team", "Join with Code", "Browse Open Teams".
   - Profile completeness indicator (shows if any optional details are missing, hidden when 100%).
3. Horizontal Swipeable Tab Bar (5 tabs):
   - **Roadmap Tab**:
     - Vertical timeline / stepper showing the official milestone progression:
       1. Registration & Profile Setup (Done / In Progress)
       2. Team Formation Deadline (Active)
       3. Problem Statement Selection (Upcoming / Unlocked)
       4. OUCE Internal Hackathon Day (20–22 Sep 2026)
     - Visual checkmarks, active pulsing state, milestone dates.
   - **Team Management Tab**:
     - Dynamic view based on team state (Solo, In-Progress, Finalized, Incomplete).
     - Roster grid showing 6 member slots (filled slots with student info, empty slots with invite/open triggers).
     - Leader tools: Copy Invite Code, Open a Slot with requirement tag, Pending join requests management.
     - Embedded SIH Rule Validator widget.
     - Integrated "Looking for Members" board.
   - **PS Explorer Tab** (NEW — lives inside the dashboard, not a separate route):
     - Full Problem Statement Explorer integrated as a dashboard tab.
     - Search bar (title/ID search) + 5 filters (Category, Theme, Organization, Innovation Scope, Invention Effort).
     - Sort controls + "Showing X of Y" result count.
     - Card listing with "Load 25 More" client-side pagination.
     - Clicking a card opens an inline detail view (slide-over panel or expandable section) with Overview + Analysis tabs.
     - "Select this PS" action visible only for finalized teams (6/6 + ≥1 female).
     - All browsing is freely accessible to every student regardless of team status.
   - **Resources Tab**:
     - Official SIH 2026 Guidelines PDF download link.
     - OUCE Internal Hackathon Presentation (PPT) Template.
     - Hackathon Evaluation & Scoring Rubric.
     - College Hackathon Rules & Code of Conduct.
   - **Announcements Tab**:
     - Reverse-chronological broadcast feed from Super Admins.
     - Timestamp, admin author badge, announcement text formatting.

## Verification Criteria
- [ ] 5 tabs are visible and switching is smooth on both mobile (375px) and desktop.
- [ ] Persistent header accurately reflects current user's team state.
- [ ] Roster displays 6 interactive/visual member slots.
- [ ] PS Explorer tab loads problem statements from static JSON, filters work instantly.
- [ ] PS detail view opens inline within the dashboard (not a page navigation).
- [ ] Resources can be viewed/downloaded.
- [ ] Announcements are fetched and rendered in real time.
