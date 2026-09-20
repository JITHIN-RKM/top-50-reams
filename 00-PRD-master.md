# PRD — SIH 2026 Internal Hackathon Platform (Osmania University)

**Master document.** This consolidates `01-prd-and-features.md`, `02-architecture-and-stack.md`, `03-user-flow-and-ui.md`, `04-security-and-constraints.md`, and `05-design-bold-minimalism.md` into a single brief. Give this file plus all five source files to the AI coding agent as the full build spec.

---

## What we're building

A web platform for Osmania University's internal SIH 2026 selection round, solving two problems: (1) students can't easily form valid 6-person, gender-diverse teams, and (2) 226 official problem statements are hard to browse and understand. One website, two halves: a **Team Hub** and a **Problem Statement Explorer**, sitting inside one unified post-login dashboard, plus a role-gated **Admin Panel** for the organizing team.

**Scale:** ~550 students max, 150-250 expected. **Budget: ₹0** — every service used must stay on its free tier at this scale.

---

## Users

- **Student** — any registered participant (1st/2nd year, primarily).
- **Team Leader** — a student who created a team; holds leader-only permissions on that team.
- **Super Admin** — core organizing team, accounts created manually, never self-service.

---

## The five features (see `01-prd-and-features.md` for full detail)

1. **Onboarding** — one-time profile form (name, Gmail [auto-filled, read-only], optional roll number, branch/year, phone with country code, gender). No skills field.
2. **Team Formation** — Devfolio-style invite codes for pre-formed groups; an "open slot" board for teams needing members; a request-to-join flow for solo students. Fully decoupled from problem-statement selection — teams form first, pick a PS only after finalizing. SIH rule enforced: exactly 6 members, ≥1 female. Live red/green "Rule Validator" widget. Incomplete teams past deadline get unlocked to merge elsewhere.
3. **Unified Dashboard** — one page, persistent team-status header, horizontal tab bar (Roadmap, Team Management, Resources, Announcements). No multi-page maze.
4. **Problem Statement Explorer** — search/filter/sort/"Load 25 more" pagination over a **static frontend JSON** (226 entries eventually, ~15-20 for the submission deadline), each with an Overview tab (plain-language rewrite) and an Analysis tab (our own Innovation Scope + Invention Effort, 1-5 scale). No Verdict/Evaluator/Build-plan in v1 — deferred indefinitely.
5. **Admin Panel** — same site, role-gated, fully separate account type from students. Keep the build itself simple/low-priority. Required stats: teams formed, teams half-filled, teams fully filled, new/interested members with no team, plus full student login/signup data. Anything beyond that, the organizing team can check directly via the Supabase project dashboard rather than custom-built tooling. No separate site + API bridge.

**Explicitly rejected/out of scope:** skill-tag matching, PS-based team matching, "Tinder for devs" matchmaker, dark mode, two separate websites, any Gmail inbox access.

---

## Stack (see `02-architecture-and-stack.md` for schema/detail)

- **Frontend:** Next.js + Tailwind CSS, mobile-first, light mode only.
- **Backend:** Supabase's auto-generated APIs; Next.js Server Actions/Route Handlers for custom logic (invite codes, rule validation, admin queries). No separate Node/Express server.
- **Database:** Supabase (PostgreSQL) — chosen for its built-in dashboard and generous free tier.
- **Auth:** Clerk, Google Sign-In only.
- **Problem statement data:** static `sih-2026-data.json`, filtered/paginated entirely client-side. Only the selected PS `id` is persisted to the database.
- **Core tables:** `users`, `teams`, `team_join_requests`, `announcements` — see architecture doc for full schema.

---

## Flow & structure (see `03-user-flow-and-ui.md` for full detail)

```
/                          → public landing page
/sign-in                   → Clerk, Google only
/onboarding                 → gated profile form
/dashboard                  → unified mega-dashboard (tabs: Roadmap, Team Management, Resources, Announcements)
/problem-statements          → PS Explorer listing
/problem-statements/[id]      → PS Explorer detail (Overview, Analysis)
/admin                       → Super Admin only
```

**This spec covers structure and behavior only — not visual design.** Colors, typography, and the Bold Minimalism editorial style are fully specified in `05-design-bold-minimalism.md` — pull all visual decisions from that file, not from this document.

---

## Security & constraints (see `04-security-and-constraints.md` for full detail)

- Email field always read-only, sourced from Clerk OAuth — never manually editable.
- No Gmail inbox/content access under any circumstance — OAuth email only.
- Role enforcement via Supabase Row Level Security, not just frontend guards.
- **Problem statement content must be 100% independently written** from the official SIH source text — never copy another hackathon-coaching site's wording, structure, or scoring framework. This is a hard legal/compliance rule, not a style preference.
- Every service used must stay within its free tier at ~550 users — flag any design choice that risks metered usage.
- Auto-unlock incomplete teams past the formation deadline so members aren't stuck.

---

## Build priority for the deadline

1. Auth + onboarding gate working end-to-end.
2. Team creation, invite-code join, open-slot board, request-to-join, Rule Validator widget — this is the highest-value, most novel mechanic.
3. Unified dashboard shell with the four tabs (Roadmap/Resources/Announcements can be simple/static content initially).
4. PS Explorer with ~15-20 fully rewritten problem statements, full filter/search/pagination working — prove the pattern works before scaling content to 226.
5. Admin panel with the baseline stats.

## Open questions to confirm with the organizing team before/while building

- Exact event and milestone dates for the Roadmap tab.
- Team-formation deadline date/time (drives the incomplete-team auto-tag).
- Any additional admin exports needed (e.g., CSV download of registrations).
