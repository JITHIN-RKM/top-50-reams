# Security & Constraints — SIH Internal Hackathon Platform

**Companion to:** `01-prd-and-features.md`, `02-architecture-and-stack.md`, `03-user-flow-and-ui.md`.

This document sets hard guardrails. Coding agents should treat every rule below as non-negotiable unless the organizing team explicitly revises it in writing.

---

## 1. Data Protection

- Collect only the fields defined in `01-prd-and-features.md` Section 4 (name, email, roll number, branch/year, phone, gender). Do not add extra personal data collection (no addresses, no ID uploads, no photos) unless explicitly requested later.
- **Email field is read-only in the app**, sourced from Clerk's verified Google OAuth response. Never let a user manually type/edit this field — doing so would let a student's Supabase profile diverge from their authenticated Clerk identity, breaking the link between "who is logged in" and "whose data this is."
- **No Gmail inbox access, ever.** The only thing pulled from Google is the verified email address via standard OAuth sign-in. This is explicitly *not* "scraping Gmail" — do not request Gmail read scopes, do not build any feature that reads a user's inbox/contacts/calendar. If this is ever raised again, the answer is: OAuth email only, nothing else.
- Roll number is optional by design (freshers may not have one) — do not make it a blocking required field.
- Gender is required specifically because it drives the SIH mandatory-diversity rule (Section 5.1 of `01-prd-and-features.md`) — this is the one sensitive-adjacent field that's functionally necessary; don't collect anything beyond it (no additional demographic fields).

---

## 2. Access Control

Two roles only: `student`, `super_admin`. Enforce with **Supabase Row Level Security (RLS)**, not just UI hiding:

- A student can read/write their own `users` row only.
- A student can read their own team's data; only the team's `leader_id` can:
  - Generate/regenerate the team's invite code
  - Open a slot / edit the `open_slot_requirement` tag
  - Accept or decline entries in `team_join_requests` for their team
  - Trigger the "Select Problem Statement" write once the team is finalized
- Only `super_admin` role can read aggregate views across all users/teams (the `/admin` dataset).
- `super_admin` accounts are provisioned manually by Jithin — there is no public "admin sign-up" path, ever.
- Frontend route guards (Next.js middleware on `/admin/**` and the onboarding gate) are a **second layer**, not a substitute for RLS. Assume the frontend guard can be bypassed and the database policy is the real enforcement.

---

## 3. Invite Code Integrity

- Invite codes are 6-character alphanumeric, generated server-side, and checked for uniqueness against existing codes before being assigned (retry-on-collision).
- Joining via code is a direct add — but the code itself is the gate, so codes should not be predictable/sequential. Use a proper random generator, not an incrementing counter.
- Consider basic rate-limiting on the "join via code" endpoint to blunt brute-force guessing attempts, given the code space is small (6 alphanumeric chars).

---

## 4. Problem Statement Content — IP & Rewrite Mandate

**This is the most legally sensitive part of the build. Read carefully.**

Context: The structural approach for the PS Explorer (categories, filters, the Level 1 / Level 2 framing, "Load More" pagination) is inspired by an existing hackathon-coaching website (CodeHunters Academy). The underlying *problem statement facts* (PS number, ministry, theme, official ask) originate from the official SIH portal, which publishes under CC BY 4.0 — that data itself is fine to use as a factual foundation.

What is **not** fine, and must be enforced as a hard rule for any AI content-generation pipeline built for this feature:

- **Do not copy CodeHunters' exact wording, sentence structure, or phrasing anywhere.** Every field (Background, The Ask, Real Struggle, Expected Solution, Key Points, Innovation Scope rationale, Invention Effort rationale) must be **independently generated from the official SIH problem statement text**, not paraphrased from CodeHunters' page.
- **Do not build/copy their distinctive analysis layers at all in v1:** Verdict, Evaluator Questions, 36-hour Build Plan, and their specific scoring/interpretation methodology are excluded from this build entirely (deferred indefinitely, not just "post-submission" — do not lift their framework even with different wording).
- **Innovation Scope and Invention Effort are conceptually similar dimensions but must use our own 1–5 scale, our own level definitions, and our own scoring criteria**, written from scratch. The dimension *names* being similar is fine (they're generic hackathon-coaching concepts); the *definitions and scoring logic* must not be lifted or lightly reworded from theirs.
- If an AI pipeline is used to auto-generate the 226-entry dataset, the system prompt for that pipeline must explicitly instruct: *"Generate this analysis directly from the official SIH problem statement text below. Do not reference or reproduce any third-party hackathon-coaching website's wording, structure of argument, or specific phrasing."*
- This is practical guidance for building the product responsibly, not a legal clearance. If the platform is ever made public-facing beyond internal college use, get this content layer reviewed by someone qualified before wide release.

---

## 5. Cost Ceiling (must never be silently violated)

- The entire system must operate within the **free tiers of Clerk and Supabase** at the ~550-student ceiling. This is a hard constraint (government college project, zero budget), not a soft preference.
- Any architecture decision that would add metered usage — e.g., moving problem-statement browsing into a database-backed, per-filter API call instead of the static-JSON approach — should be flagged and avoided.
- Before adding any new third-party service (analytics, email sending, file storage, etc.), confirm it has a free tier that comfortably covers this scale, or don't add it.

---

## 6. Abuse / Data Hygiene

- **Empty/abandoned teams:** if a team never reaches the 6/6 + diversity requirement by the team-formation deadline, auto-tag it `incomplete` and unlock its members to leave and join other open teams, rather than letting them sit stuck in a dead team.
- Prevent a student from being on more than one team at a time (`team_id` on `users` is single-valued by design — joining a new team should require leaving the old one first, with a confirmation step).
- Duplicate team-creation spam: consider a reasonable per-user limit on how many teams a single account can create/lead, to avoid clutter on the "Looking for Members" board.

---

## 7. Explicit Non-Goals (security-relevant)

- No password-based auth for students — Google Sign-In via Clerk only, which removes an entire class of password-security concerns.
- No public admin self-registration, ever.
- No feature that reads, stores, or displays any user's Gmail content beyond the OAuth-verified email address itself.
