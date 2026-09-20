# User Flow & UI Structure — SIH Internal Hackathon Platform

**Companion to:** `01-prd-and-features.md` and `02-architecture-and-stack.md`.

**Scope boundary — read this first:** This document defines **routes, screen structure, component states, and interaction flow only**. It does **not** cover colors, typography, spacing, imagery treatment, or any visual styling — that is owned entirely by the separate **Bold Minimalism design system** (already finalized: SIH Blue/Orange palette, Anton/Bebas Neue + Raleway/Inter typography, light-mode-only, mobile-first oversized-typography editorial style). When implementing, pull all visual decisions from that design system and use this document only for what exists on each screen and how it behaves.

---

## 1. Route Map

```
/                        → Landing page (public, pre-login)
/sign-in                 → Clerk-hosted or embedded sign-in (Google only)
/onboarding               → One-time profile completion form (gates everything below)
/dashboard                → Unified mega-dashboard (main app home post-login)
/problem-statements        → PS Explorer — listing/filter/search
/problem-statements/[id]    → PS Explorer — detail view (Overview + Analysis tabs)
/admin                     → Super Admin dashboard (role-gated)
```

---

## 2. Landing Page (`/`)

Public, no login required. Purpose: give context before the student commits to signing up.

Content blocks (structure, not visuals):
- Event name/branding header
- Short "what is this" section (internal SIH selection round context)
- High-level timeline teaser (not the full interactive roadmap — that lives post-login)
- Primary CTA: **Register / Sign In**
- College identity block (logo/name — keep light, doesn't need to be extensive)

Clicking the CTA routes to `/sign-in`.

---

## 3. Onboarding Flow (`/onboarding`)

Triggered automatically on first login when `onboarding_complete = false`.

1. Form renders with the fields from `01-prd-and-features.md` Section 4.
2. Email field is pre-filled from Google OAuth and **rendered read-only/disabled** — the student cannot type into it.
3. Phone number field: country-code dropdown (default `+91`) + number input.
4. Roll Number field is visibly marked optional (e.g. "Roll Number (optional — leave blank if not yet assigned)").
5. Gender field is required — do not let the form submit without it (blocks the SIH diversity rule downstream).
6. On submit: validate required fields → write to `users` table → set `onboarding_complete = true` → redirect to `/dashboard`.
7. If a student somehow lands on `/dashboard` or `/problem-statements` before completing onboarding, redirect them back to `/onboarding`. This gate applies everywhere post-login.

---

## 4. Unified Dashboard (`/dashboard`)

Single page, structured as a **persistent header + horizontal swipeable tab bar**, inspired structurally by the Hack2Skill reference screenshot.

### 4.1 Persistent header (always visible regardless of active tab)
- If the student **has a team**: team card showing team name, member count (e.g. "4/6"), member avatars/initials, and current status (Forming / Open for Members / Finalized / Incomplete).
- If the student **has no team**: a lighter-weight prompt state instead — "You don't have a team yet" with quick actions (Create Team / Browse Open Teams / Enter Invite Code).
- Registration/profile-completeness indicator, shown only until 100% complete, then hidden.

### 4.2 Tab bar (horizontal, swipeable on mobile — matches the reference screenshot's tab pattern)

**Tab: Roadmap**
- Vertical timeline/stepper: Registration → Team Formation Deadline → Problem Statement Selection → Internal Hackathon Day.
- Each step shows a completion state (done/current/upcoming).

**Tab: Team Management**
- State depends on the student's current team status — build all of these as states of one component, not separate pages:
  - **No team:** three actions — Create Team, Enter Invite Code, Browse Open Teams.
  - **In a forming team (not yet 6/6):** roster of current members, invite code (leader can copy/share), "Open a Slot" action (leader only) with a field to tag what's needed (e.g. "Need: Female Member"), and pending join requests to approve/decline (leader only).
  - **Team finalized (6/6 + diversity met):** SIH Rule Validator widget shown fully green, with the unlocked action **"Choose Problem Statement"** → routes to `/problem-statements`.
  - **Team incomplete (past deadline, didn't hit 6/6):** status banner explaining the team is incomplete, with an action for members to leave and rejoin another open team.
- **SIH Rule Validator widget** (visible whenever the student has a team, any status): two rows — Team Size (current/6) and Diversity (has female member: yes/no) — each with a red/green state. A third row, Problem Statement, stays locked/greyed until both above are green.
- **Browse Open Teams view** (for solo students, or when clicking "Browse Open Teams"): list of teams flagged with `open_slot_requirement`, each with a "Request to Join" action.

**Tab: Resources**
- List/download links: official SIH PS PDFs, presentation templates, internal college rulebook.

**Tab: Announcements**
- Reverse-chronological feed of organizer posts (read-only for students; Super Admins post from `/admin`).

---

## 5. Problem Statement Explorer (`/problem-statements`)

### 5.1 Listing view
- Top bar: Search input (title search) + Sort control.
- Filter row: Category, Theme, Organization, Innovation Scope, Invention Effort (five filters — no Verdict filter in v1).
- Result count indicator (e.g. "Showing 25 of [dataset size]").
- Card grid/list: each card shows PS number, title, ministry, theme, category, Innovation Scope + Invention Effort tags. Tapping a card routes to `/problem-statements/[id]`.
- **"Load 25 More"** button at the bottom of the list — appends the next batch client-side from the static JSON. No numbered pagination, no infinite auto-scroll.
- All filtering/search/sort/pagination happens client-side against the static `sih-2026-data.json` — no network round-trip per filter change.

### 5.2 Detail view (`/problem-statements/[id]`)
Two tabs:
- **Overview** — Background, The Ask, Real Struggle, Expected Solution, Key Points (all rendered as plain-language content per the rewrite mandate — content rules live in `security-and-constraints.md`, this doc only defines that these fields exist and their order).
- **Analysis** — Innovation Scope and Invention Effort, each shown with its 1–5 rating and the plain-language definition for that score.
- If the viewing student's team has already selected a PS, and this isn't the one they picked, show a lightweight indicator (e.g. "Your team hasn't selected this one") rather than blocking the view — students should still be able to browse everything freely, even after their team locks a choice, in case organizers allow changes later.
- A **"Select this Problem Statement"** action is only shown/enabled if: (a) the viewer's team is `finalized` (6/6 + diversity met), and (b) the viewer is on that team. Otherwise this action is hidden.

---

## 6. Admin Dashboard (`/admin`)

Role-gated to `super_admin` only — redirect any non-admin user attempting to access this route.

Keep this screen simple — it's the lowest priority build item relative to the team-formation and PS-explorer flows. Structure (content, not visuals):
- Summary counts (confirmed required): **teams formed**, **teams half-filled**, **teams fully filled**, **new/interested members with no team**.
- Full student login/signup list — every registered student's profile and registration timestamp.
- Team list/table: name, member count, status, diversity check pass/fail, selected PS (if any).
- Announcement composer: a simple form to post a new entry into the `announcements` feed students see on their dashboard.
- Anything beyond this (raw exports, deeper filtering) is not required for v1 — the organizing team can use the Supabase project dashboard directly for anything not covered above.

---

## 7. Cross-cutting Interaction Rules

- **Mobile-first:** design and build for the phone breakpoint first (per planning notes, ~90% of usage is expected to be mobile), then scale up.
- **No dark mode** — light mode only, everywhere, including the admin panel.
- **No deep navigation trees.** The whole student-facing experience should be reachable from the dashboard tab bar or the PS Explorer — avoid burying actions behind more than one extra click from `/dashboard`.
- **Onboarding gate** applies to every authenticated route except `/sign-in` itself.
- **Role gate** applies to every `/admin/**` route.
