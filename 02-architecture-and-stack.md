# Architecture & Tech Stack — SIH Internal Hackathon Platform

**Companion to:** `01-prd-and-features.md`. Read that first for feature context — this document defines how the system is built, not what it does.

**Hard constraint governing every decision below: this must run on the free tiers of every service used. Zero budget — this is a government college project.**

---

## 1. Stack Summary

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js + Tailwind CSS** | Fast routing, SSR for quick loads, mobile-first friendly, no dark mode needed |
| Backend | **Supabase auto-generated APIs** (PostgREST) via Next.js Server Actions / Route Handlers for custom logic | No separate Node/Express server needed — Supabase's instant REST/Realtime API covers CRUD; use Next.js server-side code only for logic that needs validation (invite code generation, rule-checking, admin queries) |
| Database | **Supabase (PostgreSQL)** | Has a built-in web dashboard to browse/edit data directly (like Firebase console) — was the deciding factor over raw MongoDB, which has no equivalent without separately standing up MongoDB Atlas. Free tier: 500MB storage, 50,000 MAU — vastly more than the 550-student ceiling. |
| Auth | **Clerk** | ~10 min setup, built-in Google Sign-In, pre-built light-mode auth screens, doesn't require a DB connection just to authenticate. Free tier covers 10,000–50,000 MAU. |
| Problem Statement data | **Static JSON file, frontend-only** | Zero DB load, zero rate limits, instant client-side filtering — see Section 4 |
| Hosting | Vercel (or equivalent free-tier Next.js host) | Standard pairing with Next.js |

> **Superseded decision:** Early planning considered MongoDB + a Node/Express backend. This was replaced by Supabase, which provides the database *and* the backend API in one free-tier product with a visual dashboard. Do not build a separate Express server for standard CRUD.

---

## 2. Database Schema (Supabase / PostgreSQL)

This is a starting schema derived directly from the features in `01-prd-and-features.md`. Coding agent may normalize further, but must preserve these entities and relationships.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | maps to Clerk user id |
| full_name | text | |
| email | text (unique) | from Clerk Google OAuth, **read-only in app**, source of truth is Clerk |
| roll_number | text, nullable | optional field |
| branch | text | |
| year | text/enum | |
| phone_country_code | text | default `+91` |
| phone_number | text | |
| gender | text | required — feeds the diversity rule |
| role | enum: `student`, `super_admin` | default `student`; super_admin set manually by Jithin, never self-service |
| onboarding_complete | boolean | gates dashboard access |
| team_id | uuid, nullable (FK → teams.id) | |
| created_at | timestamp | |

### `teams`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| invite_code | text (unique, 6 chars) | generated on team creation |
| leader_id | uuid (FK → users.id) | |
| status | enum: `forming`, `open_for_members`, `finalized`, `incomplete` | see Section 5.4 of PRD |
| open_slot_requirement | text, nullable | e.g. "Need: Female Member" — shown on the public board |
| problem_statement_id | text, nullable | references the **static JSON** `id` (e.g. `"PS101"`), not a DB row — see Section 4 |
| created_at | timestamp | |

### `team_join_requests`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| team_id | uuid (FK → teams.id) | |
| requester_id | uuid (FK → users.id) | |
| status | enum: `pending`, `accepted`, `declined` | |
| created_at | timestamp | |

### `announcements`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| body | text | |
| posted_by | uuid (FK → users.id, role=super_admin) | |
| created_at | timestamp | |

### Derived/computed (not stored, calculated on read)
- Team size = count of `users` where `team_id = team.id`
- Diversity check = count of `users` where `team_id = team.id AND gender = 'female'` ≥ 1
- These two feed the SIH Rule Validator widget directly — do not store as separate booleans that could drift out of sync; compute live.

---

## 3. Auth & Identity Flow

1. Student signs in via **Clerk → Google Sign-In only** (no email/password flow needed for students).
2. Clerk returns the verified Google email — this becomes `users.email`, populated automatically and **rendered read-only** in the onboarding form. Never allow manual edits to this field (prevents identity mismatch between the authenticated Clerk session and the Supabase record — see `security-and-constraints.md`).
3. First login with no `onboarding_complete = true` → redirect to onboarding form.
4. Onboarding completes → `users` row updated → redirect to Dashboard.
5. **Super Admin accounts:** created manually by Jithin directly in Clerk/Supabase (not through public sign-up), with `role = super_admin` set at creation.

---

## 4. Problem Statement Data — Static JSON Strategy

This is a deliberate architectural choice to avoid database load/rate limits under deadline pressure, and it should remain the approach post-launch too (226 rows of mostly-static text don't need a database).

- Single file: **`sih-2026-data.json`**, bundled with the frontend.
- Each entry is a clean data object:

```json
{
  "id": "PS101",
  "title": "...",
  "organization": "...",
  "theme": "...",
  "category": "Software | Hardware",
  "level1": {
    "background": "...",
    "the_ask": "...",
    "real_struggle": "...",
    "expected_solution": "...",
    "key_points": ["...", "..."]
  },
  "level2": {
    "innovation_scope": 1-5,
    "invention_effort": 1-5
  }
}
```

- Next.js maps over this array client-side for filtering, search, sort, and the "Load 25 more" pagination — **no Supabase query involved in browsing problem statements.**
- When a team finalizes their pick, only the string `id` (e.g. `"PS101"`) is written to `teams.problem_statement_id` in Supabase. The full text always resolves from the static JSON, never duplicated into the database.
- **Every field in this dataset must be independently written** per the rewrite mandate below — this is a content rule, not just a technical one, and applies regardless of how the data is stored.

### 4.1 Content Rewrite Mandate (confirmed, non-negotiable)

The PS Explorer's structure (categories, filters, the Level 1/Level 2 framing, "Load More" pagination) is inspired by an existing hackathon-coaching site, CodeHunters Academy (`codehuntersacademy.com`). That site is a reference for **layout/structure only**.

- **Official SIH problem-statement facts** (PS number, ministry, theme, category, the official ask) come from the official SIH government portal — this is the only content that is "sourced," not rewritten, since it's the underlying factual data every team is working from.
- **Everything else in this dataset — every Overview field (Background, The Ask, Real Struggle, Expected Solution, Key Points) and every Analysis field (Innovation Scope, Invention Effort, and their scoring definitions) — must be independently rewritten from the official SIH text.** Nothing is copied or lightly paraphrased from CodeHunters or any third-party site.
- If any AI content-generation pipeline is built to help produce these 226 entries, its prompt must generate directly from the official SIH problem statement text and must not reference or reproduce CodeHunters' (or any other site's) wording, argument structure, or scoring framework.
- Full detail and rationale: see `04-security-and-constraints.md`, Section 4. This note exists here too so the rule is visible wherever the JSON dataset itself is being built, not just in the security doc.

---

## 5. Invite Code Generation

- 6-character alphanumeric code, generated server-side (Next.js Route Handler or Supabase function) on team creation.
- Must be checked for uniqueness against existing `teams.invite_code` before assignment (collision retry loop).
- Join-via-code is a direct write (add `team_id` to the requesting user's row) — no approval step, unlike the "Request to Join" flow in Scenario C, which does require leader approval via `team_join_requests`.

---

## 6. Role-Based Access (implementation notes)

- Two roles only: `student`, `super_admin`.
- Enforce at the database layer with Supabase **Row Level Security (RLS) policies**, not just frontend route guards:
  - Students can read/write their own `users` row and their own team's data.
  - Only the `leader_id` on a team can generate/regenerate its invite code, open a slot, or accept/decline join requests for that team.
  - Only `super_admin` role can read the aggregate admin views (all users, all teams).
- Admin routes (`/admin/**`) additionally gated at the Next.js middleware level as a second layer, not a replacement for RLS.

---

## 7. Cost Ceiling Checklist (verify before every architecture decision)

- [ ] Does this feature require a paid Clerk tier? (Should never — 550 users is ~1-5% of free MAU limit.)
- [ ] Does this feature require a paid Supabase tier? (Should never — 550 users, mostly text data, is a fraction of the 500MB/50k MAU free tier.)
- [ ] Does this feature add database load that could be served statically instead? (Problem statements: always static. Team/user data: DB is appropriate since it's genuinely dynamic.)

---

## 8. Admin Dashboard — Data & Metrics (confirmed scope, keep the build itself simple)

This is deliberately low-priority to build relative to the team-formation and PS-explorer backend — keep the implementation plain. The required data is straightforward aggregate queries over the existing `users` and `teams` tables from Section 2; no new tables needed.

| Metric | Query logic |
|---|---|
| Teams formed | `count(teams)` — any status |
| Teams half-filled | `count(teams)` where member count (via `users.team_id`) is between 1 and 5 |
| Teams fully filled | `count(teams)` where member count = 6 |
| New/interested members with no team | `count(users)` where `onboarding_complete = true AND team_id IS NULL` |
| All student login/signup data | `select * from users` — full list with registration timestamps |
| Team diversity/PS status | per-team: diversity check pass/fail, `problem_statement_id` if selected |

**Raw database access:** beyond these in-app metrics, super admins (the core organizing team) can use the Supabase project dashboard directly for anything else — do not build a custom database browser or export tooling for v1. This keeps the admin surface area small and low-risk.
