# Project: SIH 2026 Internal Hackathon Platform (Osmania University)

## Context & Vision
A web platform for Osmania University's internal SIH 2026 selection round.
- **Scale:** ~550 students addressable, 150-250 expected.
- **Budget:** ₹0 (Free tier only for Clerk, Supabase, Vercel).
- **Core Pillars:**
  1. Auth & Onboarding Gate (Google Sign-In only, locked email, gender collection for rule engine)
  2. Team Formation & Live SIH Rule Validator (Invite codes, Open Slot board, Request-to-join, 6 members + >=1 female check)
  3. Unified Mega-Dashboard (Persistent Team Header + 4 tabs: Roadmap, Team Management, Resources, Announcements)
  4. Problem Statement Explorer (15-20 fully rewritten problem statements, client-side filtering/search, Overview + Analysis tabs)
  5. Super Admin Panel (Baseline stats, team oversight, student registry, announcement composer)

## Stack
- **Framework:** Next.js 15+ (App Router) + TypeScript
- **Styling:** Tailwind CSS (Bold Minimalism System - File 05)
- **Database & RLS:** Supabase PostgreSQL
- **Auth:** Clerk (Google OAuth only)
- **PS Data:** Static frontend JSON `sih-2026-data.json`

## Design System Tokens
- Primary: `#0072BC` (SIH Blue)
- Deep Blue: `#005A9C`
- Accent: `#F58220` (SIH Orange)
- Light Orange: `#F9A65A`
- Background: `#FFFFFF` / Surface: `#F3F5F7`
- Dark Text: `#1F2937`
- Display Fonts: Anton / Bebas Neue
- Body Fonts: Raleway / Inter
