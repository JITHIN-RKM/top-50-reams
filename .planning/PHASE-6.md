# Phase 6: SEO, Indexing, and Performance

## Goal
Perform comprehensive SEO research, generate an audit, and implement a top-notch search engine optimization and indexing strategy for the OUCE SIH 2026 Internal Hackathon platform. Create and submit sitemaps to Google Search Console.

## SEO Audit Findings
- **MetadataBase Mismatch**: `layout.tsx` has a hardcoded placeholder `https://oucesih2026.com` instead of the actual domain `https://sih2026.ouce.ac.in`.
- **Sitemap Completeness**: `sitemap.ts` only includes `/` and `/sign-in`. It misses the `/problem-statements` index and dynamic `/problem-statements/[id]` pages, which are crucial for organic search traffic.
- **Robots.txt**: Excludes `/dashboard`, `/admin`, and `/onboarding` which is correct, but should explicitly allow `/problem-statements`.
- **OpenGraph/Twitter Cards**: Needs dynamic generation for problem statement pages to improve sharing on WhatsApp/Twitter.

## Implementation Plan
1. **Fix `metadataBase`**: Update `layout.tsx` to use the environment variable for the base URL.
2. **Dynamic Sitemap**: Update `sitemap.ts` to read all problem statements from `sih-2026-data.json` (if available in a format importable server-side) and generate URLs for each problem statement, as well as add `/problem-statements`.
3. **Dynamic SEO Metadata**: Implement `generateMetadata` in `src/app/problem-statements/[id]/page.tsx` for dynamic OpenGraph/Twitter cards.
4. **Google Search Console Preparation**:
   - Provide instructions for domain verification and sitemap submission.

## Verification Criteria
- [x] `metadataBase` correctly points to the actual deployment URL.
- [x] `sitemap.xml` correctly lists all problem statements.
- [x] `robots.txt` points to the correct sitemap URL.
- [x] Problem statement pages generate dynamic meta tags.
