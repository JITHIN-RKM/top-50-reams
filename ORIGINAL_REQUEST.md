# Original User Request

## Initial Request — 2026-08-28T00:09:24+05:30

Write a Node.js script using a provided Google Service Account key to authenticate with the Google Search Console API. The script should verify the domain `https://sih-ouce.meetthealtezza.tech` and submit the `sitemap.xml` URL.

Requirements:
1. Authentication & Setup: Read Google Service Account credentials from a local file (e.g., `gsc-credentials.json` or `.env` / environment variables). Use the official `googleapis` package to authenticate.
2. Site & Sitemap Registration: Programmatically add the property `https://sih-ouce.meetthealtezza.tech/` to the authenticated Google Search Console account, and submit the sitemap URL `https://sih-ouce.meetthealtezza.tech/sitemap.xml`.
3. Script Execution:
   - Must execute cleanly without syntax or runtime errors.
   - Outputs confirmation from the Google API that the property was added and the sitemap was submitted.
   - Gracefully handles and logs API errors (e.g. if the service account lacks permissions, already exists, etc.).
