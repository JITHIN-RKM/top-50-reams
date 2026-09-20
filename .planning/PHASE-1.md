# Phase 1: Auth & Onboarding Gate Spec

## Objectives
1. Initialize Next.js 15+ App Router application with Tailwind CSS, TypeScript, and Lucide React.
2. Setup Clerk Auth strictly configured for Google OAuth Only (social login only; disable email/password).
3. Setup Supabase Client and Database schema for `users` table:
   - `id` (uuid, PK, maps to Clerk user ID)
   - `full_name` (text, prefilled from Google, editable)
   - `email` (text, unique, prefilled from Google, strictly read-only)
   - `roll_number` (text, nullable, optional)
   - `branch` (text, required dropdown: CSE, ECE, EEE, MECH, CIVIL, BME, AIML, etc.)
   - `year` (text, required dropdown: 1st Year, 2nd Year, 3rd Year, 4th Year)
   - `phone_country_code` (text, default: '+91')
   - `phone_number` (text, required)
   - `gender` (text, required: 'female', 'male', 'other')
   - `role` (enum: 'student', 'super_admin', default: 'student')
   - `onboarding_complete` (boolean, default: false)
   - `team_id` (uuid, nullable, FK to teams)
   - `created_at` (timestamp)
4. Design and build `/sign-in` page with Bold Minimalism style.
5. Design and build `/onboarding` page:
   - Read-only email from Clerk session.
   - Comprehensive validation (Zod schema).
   - Form submission updates Supabase `users` table and marks `onboarding_complete = true`.
6. Middleware route protection:
   - Non-authenticated visitors accessing `/dashboard`, `/problem-statements`, `/admin` -> redirect to `/sign-in`.
   - Authenticated users with `onboarding_complete = false` -> redirect to `/onboarding`.
   - Authenticated users with `onboarding_complete = true` visiting `/onboarding` or `/sign-in` -> redirect to `/dashboard`.

## Verification Criteria
- [ ] User can sign in using Google.
- [ ] User with incomplete onboarding cannot access `/dashboard` or `/problem-statements`.
- [ ] Email field is disabled/read-only in the onboarding form.
- [ ] Gender is required and properly saved.
- [ ] Upon submitting onboarding, user is smoothly redirected to `/dashboard`.
