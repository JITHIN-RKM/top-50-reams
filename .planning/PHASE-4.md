# Phase 4: Problem Statement Explorer Spec (Lives Inside Dashboard Tab)

## Objectives

> **IMPORTANT:** The PS Explorer is NOT a separate route. It is the 3rd tab ("PS Explorer") inside the `/dashboard` mega-dashboard. The separate `/problem-statements` and `/problem-statements/[id]` routes from earlier planning are retired. All PS browsing, filtering, search, and detail views happen inline within the dashboard.

1. Static JSON Dataset (`sih-2026-data.json`):
   - Store **all 226** problem statements.
   - Strictly adhere to the **Content Rewrite Mandate**: 
     - The official government data (from sih.gov.in) such as Title, Organization, Category, and basic descriptions can be kept as is.
     - However, any custom analysis from CodeHunters (the specific wording of Overview, Analysis, Innovation Scope, and Invention Effort) **MUST be completely rewritten**. We are cloning their *structure*, but we must generate unique phrasing and grammar for all 226 statements to avoid direct plagiarism.
   - Fields per entry:
     - `id`: e.g. "SIH1601"
     - `title`: e.g. "AI-Powered Real-Time Crop Disease Detection and Advisory for Smallholder Farmers"
     - `organization`: Ministry/Department (e.g. "Ministry of Agriculture & Farmers Welfare")
     - `theme`: Theme (e.g. "Agriculture, FoodTech & Rural Development")
     - `category`: "Software" | "Hardware"
     - `level1`:
       - `background`: Contextual background
       - `the_ask`: Core deliverables and goals in plain language
       - `real_struggle`: Fundamental technical/logistical bottlenecks
       - `expected_solution`: High-level recommended system architecture
       - `key_points`: Array of critical requirements
     - `level2`:
       - `innovation_scope`: Number 1–5 + scoring rationale (string)
       - `innovation_scope_score`: Number 1–5
       - `invention_effort`: Number 1–5 + complexity rationale (string)
       - `invention_effort_score`: Number 1–5
2. PS Explorer Tab (within `/dashboard`):
   - Fast client-side searching over title, id, organization, theme, keywords.
   - 5 interactive filter controls:
     1. Category (All, Software, Hardware)
     2. Theme (Dynamic list based on dataset)
     3. Organization (Dynamic list of Ministries/Orgs)
     4. Innovation Scope (1 to 5)
     5. Invention Effort (1 to 5)
   - Sort control (PS Number, Title A-Z, Innovation Scope High-to-Low, Invention Effort Low-to-High).
   - "Showing X of Y problem statements" indicator.
   - "Load 25 More" client-side batching.
   - Cards designed with Bold Minimalism: high contrast, category tag, theme badge, Innovation & Effort pill metrics.
3. PS Detail View (inline slide-over / expandable panel):
   - Opens within the dashboard — NOT a separate page navigation.
   - Header with PS ID, Title, Ministry/Org, Category badge, Theme tag.
   - Two Tabbed Views:
     - **Overview Tab**: Background, The Ask, Real Struggle, Expected Solution Architecture, Key Points bullet list.
     - **Analysis Tab**: Innovation Scope (1-5 visual gauge + rationale), Invention Effort (1-5 visual gauge + rationale).
   - Team PS Selection Action:
     - Enabled and visible only if the user belongs to a `finalized` team (6/6 members + >=1 female).
     - If selected, writes `problem_statement_id` to Supabase `teams` table.
     - Visual badge indicates whether this PS is currently selected by the team.
     - If team is NOT finalized, show a hint: "Finalize your team (6 members + ≥1 female) to select a problem statement."

## Verification Criteria
- [ ] 15–20 high-quality, completely rewritten problem statements loaded from static JSON.
- [ ] PS Explorer tab works within the dashboard (no page navigation to a separate route).
- [ ] Instant client-side filtering by Category, Theme, Org, Innovation Scope, Invention Effort.
- [ ] Fast search matching titles, IDs, and ministries.
- [ ] "Load More" pagination appends entries smoothly.
- [ ] Detail view opens inline as a slide-over panel within the dashboard.
- [ ] Finalized team can select a problem statement and see it persisted.
- [ ] Non-finalized teams can still browse everything but see a "finalize your team" hint instead of the select button.
