# PRD & Features — SIH Internal Hackathon Platform

**Project:** SIH 2026 Internal Hackathon Website — Osmania University
**Owner:** Jithin (core organizing team)
**Status:** Final scope for v1 (submission build). Do not add features outside this doc without an explicit scope-change note.

---

## 1. Problem Statement

The college is running an internal selection round for Smart India Hackathon (SIH) 2026. Two problems need solving:

1. **Team formation is chaotic.** Some students already have friend-groups formed into teams. Others are solo ("free agents") with no team. Teams that are 4-5 people often can't find their last 1-2 members — and SIH mandates exactly 6 members per team with at least 1 female member, which is the hardest slot to fill.
2. **Problem statement discovery is scattered.** SIH 2026 has 226 official problem statements across ministries/themes. Students need a fast way to browse, filter, and understand them in plain language — but PS selection only happens *after* a team is finalized, not before.

## 2. Target Users & Scale

- **Audience:** Osmania University students only, primarily 1st and 2nd year.
- **College strength:** ~550 students total addressable.
- **Expected registrations:** 150–250 students realistically, but the system must comfortably support up to 550 without hitting paid tiers.
- **Roles:**
  - **Student** — any registered participant.
  - **Team Leader** — a student who created a team (same account type as Student, just holds leader permissions on their team).
  - **Super Admin** — core organizing team. Accounts are created manually by Jithin (not self-service signup).

## 3. Core Product Pillars

1. **Landing Page** — public, pre-login, event context.
2. **Onboarding / Profile** — one-time form after first login, gates access to the dashboard.
3. **Team Hub** — Devfolio-style invite-code team formation + Hack2Skill-style unified dashboard (roadmap, resources, announcements).
4. **SIH 2026 Problem Statement Explorer** — CodeHunters-inspired browsing experience, but with 100% independently written content (see Section 7 and `security-and-constraints.md`).
5. **Admin Panel** — same website, role-gated section for the core team to monitor registrations and teams.

> **Note on scope boundary:** This document and its companion files (`architecture-and-stack.md`, `user-flow-and-ui.md`, `security-and-constraints.md`) cover **features, logic, data, and structure only**. Visual design — colors, typography, spacing, poster/image treatment — is governed by the separate **Bold Minimalism design system** (already finalized). Do not redesign or reinterpret colors/fonts from these docs; pull them from the design system when implementing.

---

## 4. Feature 1 — Onboarding / Profile

Triggered once, right after first login, before the student can access the dashboard.

**Fields:**

| Field | Required? | Notes |
|---|---|---|
| Full Name | Yes | Can prefill from Google account, editable |
| Email (Gmail) | Yes | Auto-filled from Google Sign-In via Clerk. **Read-only, cannot be edited.** See `security-and-constraints.md`. |
| Roll Number | No (optional) | Freshers often don't have one assigned yet |
| Branch & Year | Yes | Dropdowns |
| Phone / WhatsApp Number | Yes | Country-code dropdown, defaults to **+91**, changeable for the occasional international student (e.g. South Sudan, Thailand) |
| Gender | Yes | Required to compute the SIH mandatory-female-member rule. Store as stated. |

**Explicitly excluded:** No "skills" field. First/second-years mostly don't have a skill list worth collecting yet, and it adds friction. Do not resurrect skill-tag matching in v1.

**Gate:** Dashboard and Team Hub are inaccessible until Roll Number/Branch/Year/Phone/Gender are filled (Roll Number is the one optional exception).

---

## 5. Feature 2 — Team Formation (the core mechanic)

Team formation is **fully decoupled from problem-statement selection.** Students form a team first; the problem statement is chosen later, only once the team is finalized. Do not build any feature that filters or matches teams by desired problem statement.

### 5.1 SIH Team Rule (hard constraint)
A valid SIH team = **exactly 6 members**, with **at least 1 female member**.

### 5.2 Three entry scenarios

**A — Pre-formed friend group (Invite Code flow, Devfolio-style)**
1. One student clicks **Create Team**, becomes Team Leader.
2. System generates a unique **6-character invite code**.
3. Leader shares the code (WhatsApp, etc.).
4. Each friend logs in → **Join via Code** → pastes code → instantly added to the team. No approval step needed for code-based joins.

**B — Team short on members ("open slot")**
1. A team (e.g. 5 members, all male) needs their last 1-2 members.
2. Leader clicks **Open a Slot** on their team dashboard and can tag the requirement, e.g. "Need: Female Member" or a generic "Need: 1 more member."
3. This team now appears on the public **"Looking for Members"** board, visibly flagged with what it needs.

**C — Solo student ("Free Agent")**
1. A student with no team browses the **"Looking for Members"** board (teams from scenario B).
2. Clicks **Request to Join** on a team.
3. Team Leader gets a notification and can **Accept** or decline.
4. On accept, student is added to that team.

There is **no skill-based matching** and **no problem-statement-based matching** in any of the three scenarios. Matching is purely: open slot exists → student requests → leader approves.

### 5.3 SIH Rule Validator (accepted feature)
A widget on the team's dashboard, visible to all team members, always live:

| Check | Logic |
|---|---|
| Team Size | Red until exactly 6/6, then green |
| Diversity | Red until ≥1 female member, then green |
| Problem Statement | Locked/greyed out until both above are green |

Once both checks pass, the widget turns fully green and unlocks a **"Team Finalized: Choose Problem Statement"** action, which routes the team into the PS Explorer to lock in their pick (see Feature 3).

### 5.4 Incomplete team handling
If a team has not reached the 6/6 + diversity requirement by the team-formation deadline, auto-tag it **"Incomplete"** and unlock its members so they can leave and join/merge into other open teams instead of being stuck.

### 5.5 Explicitly rejected features (do not build)
- **PS-Targeted Draft Board** — filtering/matching teams by problem-statement interest before team formation. Rejected: PS selection happens after the team is locked, not before.
- **Skill-Swipe Matchmaker ("Tinder for devs")** — rejected as unnecessary complexity for this audience.
- Any skill-tag-based team/member matching.

---

## 6. Feature 3 — Unified Dashboard (Hack2Skill-style)

One single page after onboarding, not a maze of separate pages. Structure (content/behavior only — visual styling comes from the design system):

- **Persistent top context:** current team card (if in a team) — team name, member avatars/initials, status.
- **Horizontal tab bar** (swipeable on mobile), sections:
  - **Roadmap / Timeline** — vertical stepper of event milestones (Registration → Team Formation Deadline → PS Selection → Internal Hackathon Day), with completed steps checked off.
  - **Team Management** — Create Team / Join via Code / Browse Open Teams / Open a Slot / SIH Rule Validator, all live here.
  - **Resources** — links/downloads: official SIH PS PDFs, presentation templates, internal rulebook.
  - **Announcements** — organizer notice-board feed (text updates posted by Super Admins).
- Registration status indicator (profile completeness) shown at the top until profile is 100% complete.

No separate "Unstop-style" multi-page navigation — this single dashboard replaces that idea entirely (explicitly deprioritized in planning).

---

## 7. Feature 4 — SIH 2026 Problem Statement Explorer

Inspired structurally by CodeHunters Academy's public PS explorer, but **all written content must be independently authored** — see `security-and-constraints.md` for the non-negotiable IP/rewrite rules. This section defines structure and fields only.

### 7.1 Listing page
- **Search bar** (title search) + **Sort**.
- **Filters:** Category (Software/Hardware), Theme, Organization/Ministry, Innovation Scope, Invention Effort. (No Verdict filter in v1 — that concept is deferred.)
- **Cards** show: PS number, title, ministry, theme, category, Innovation Scope tag, Invention Effort tag.
- **Pagination:** "Load 25 more" pattern — loads an initial batch (~24-26), then batches of 25 on demand. No infinite scroll, no numbered pages.

### 7.2 Detail page (per problem statement)
Two tabs only for v1:

**Overview tab** — plain-language rewrite of the official PS, covering:
- Background
- What's actually being asked for (the ask, in simple terms)
- The real struggle / pain point behind it
- Expected solution direction
- Key points

**Analysis tab** — our own lightweight scoring layer:
- **Innovation Scope** (1–5 scale, our own criteria/definitions)
- **Invention Effort** (1–5 scale, our own criteria/definitions)

### 7.3 Explicitly deferred to post-submission (do NOT build in v1)
- Verdict (Green/Yellow/Red)
- Evaluator Questions
- 36-hour Build Plan
- Any distinctive scoring/interpretation framework beyond the two axes above

### 7.4 Content volume plan (deadline risk mitigation)
Producing fully rewritten Level 1 + Level 2 content for all 226 problem statements before the submission deadline is not realistic and risks quality/formatting issues under time pressure.

- **v1 (submission):** fully populate **~15–20 problem statements** (one theme/ministry, enough to prove filters, pagination, search, and detail views work end-to-end).
- **Post-submission:** expand the dataset toward all 226 using the same repeatable content structure.

### 7.5 Selecting a PS
Once a team is "Finalized" (Section 5.3), the team enters the Explorer, browses/searches, and picks one problem statement. Only that PS's **id** is stored against the team record — not the full text (the text lives in the static frontend dataset; see `architecture-and-stack.md`).

---

## 8. Feature 5 — Admin Panel

Same website, not a separate site (two-site + API-bridge approach was considered and rejected as unnecessary overhead).

- Route gated to **Super Admin** role only.
- Accounts created manually by Jithin for core team members — **super admin is a fully separate account type**, not a flag on a student account.
- Keep this panel plain/simple — it is not a priority build area. The priority is the team-formation + PS-explorer backend (Section 5 and 7). Do not over-invest engineering time here.
- **Required metrics (confirmed, must be present):**
  - How many teams are **formed** (total team count, any status)
  - How many teams are **half-filled** (in progress — have some members but not yet at 6)
  - How many teams are **fully filled** (at 6/6 members)
  - How many **new/interested members** are on the board with no team yet (free agents)
- Additional visibility needed:
  - All student login/signup data — every registered student's profile and registration timestamp
  - Each team's diversity check (pass/fail) and selected PS (if any)
- **Raw database access:** super admins are the core organizing team, so for anything beyond the metrics above, they can check data directly via the Supabase project dashboard (already available to whoever administers the project) rather than building a custom database browser into the app. Don't build bespoke raw-data tooling — the plain in-app metrics above plus Supabase's own dashboard is "full and final" for v1.

---

## 9. Out of Scope for v1 (full list, consolidated)

- Skill-tag-based matching of any kind
- PS-based team matching/filtering before team formation
- Skill-Swipe "Tinder for devs" matchmaker
- Verdict, Evaluator Questions, 36-hour Build Plan, distinctive scoring/interpretation on PS pages
- Full 226-problem-statement content (only ~15-20 for v1)
- Two separate websites / cross-site API bridge for admin
- Dark mode
- Gmail inbox scraping (never in scope — only OAuth-verified email as an identity field)

## 10. Open Questions (need organizer confirmation before/while building)

- Exact event dates and milestone dates for the Roadmap timeline (a placeholder poster reference shows 20–22 Sep 2026 — confirm before hardcoding).
- Exact set of Admin dashboard metrics beyond the baseline listed in Section 8 (any exports needed, e.g. CSV?).
- Deadline date/time for "team formation closes" (drives the Incomplete-team auto-tagging in Section 5.4).
