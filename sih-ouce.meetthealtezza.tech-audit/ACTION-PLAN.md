# SEO Action Plan

## Phase 1: Critical Fixes (Immediate)

1. **Create `robots.txt`**
   - Add a `robots.txt` file in the `public/` directory.
   - Example:
     ```text
     User-agent: *
     Allow: /
     Sitemap: https://sih-ouce.meetthealtezza.tech/sitemap.xml
     ```

2. **Generate XML Sitemap**
   - Add a `sitemap.ts` (Next.js App Router) or manually place a `sitemap.xml` in the `public/` directory to help crawlers discover the pages.

3. **Add Canonical URL**
   - Add the canonical link to your `layout.tsx` metadata:
     ```typescript
     export const metadata = {
       alternates: {
         canonical: 'https://sih-ouce.meetthealtezza.tech/',
       },
     };
     ```

## Phase 2: High-Impact Improvements (Week 1)

1. **Implement Event Schema (JSON-LD)**
   - Inject `Event` structured data into the `<head>` of the application. This is crucial for event discoverability.
   - Example properties to include: `name`, `startDate`, `endDate`, `eventAttendanceMode`, `location`, `organizer`.

2. **Enhance E-E-A-T Signals**
   - Add a footer or section containing:
     - The physical address of Osmania University College of Engineering.
     - Contact email for the organizers.
     - Links to Privacy Policy and Terms of Service (if applicable).

## Phase 3: Content & Authority (Month 1)

1. **Expand Homepage Content**
   - Add an **FAQ Section** using standard `<h3>` or `<h2>` question formatting. Questions should target what students and AI engines will ask:
     - "How do I form a team for SIH 2026?"
     - "What are the rules for the internal hackathon?"
   - This fixes the "Thin Content" issue and significantly boosts AI Search Citation Readiness (GEO).

2. **Ensure Server-Side Rendering (SSR) for Problem Statements**
   - Since the problem statements (`sih2026-ps-codehunters.json`) are the core value of the platform, ensure the page rendering them does not rely purely on client-side JS without a server-rendered fallback, so Google can index the problem statements.
