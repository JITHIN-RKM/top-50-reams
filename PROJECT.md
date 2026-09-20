# Project: Google Search Console Automation for SIH OUCE

## Architecture
- **Runtime Environment**: Node.js v24 (ESM native, `"type": "module"`).
- **Core Library**: `googleapis` (Search Console API v1 / Webmasters API v3) with `google-auth-library` (`GoogleAuth`, `JWT`).
- **Target Property**: `https://sih-ouce.meetthealtezza.tech/` (URL-prefix with trailing slash).
- **Target Sitemap**: `https://sih-ouce.meetthealtezza.tech/sitemap.xml`.
- **Modularity & Architecture**:
  - `scripts/gsc-submit.js`: CLI entry point, argument parsing via `node:util.parseArgs`, formatted terminal output, exit code handling.
  - `scripts/lib/gsc-config.js`: Configuration loader supporting CLI flags, environment variables (`.env` / `process.env`), file path (`gsc-credentials.json`), inline JSON, and parameter validation.
  - `scripts/lib/gsc-client.js`: Multi-mode client adapter containing `LiveGscClient` (real GoogleAuth + searchconsole v1 API calls) and `MockGscClient` (deterministic offline test harness).
  - `scripts/lib/gsc-service.js`: Workflow orchestrator executing `addSite` -> `submitSitemap` -> `getSitemap` verification with comprehensive diagnostic error handling (401, 403, 404, 409, 429).
  - `scripts/lib/gsc-logger.js`: Clean, formatted console reporter with colors/symbols and quiet/verbose modes.
  - `tests/gsc/`: Comprehensive native test suite (`node:test`) covering configuration, mocking, service workflow, adversarial edge cases, and CLI execution (100 tests total).

## Feature Inventory
| # | Feature | Description | Milestone | Status | Source |
|---|---------|-------------|-----------|--------|--------|
| 1 | Dependency Setup | Add `googleapis` dependency and npm script `npm run gsc:submit` | M1 | DONE | Survey |
| 2 | Credential Loading & Validation | Resolve service account credentials from CLI flag, `.env`, `gsc-credentials.json`, or inline JSON; validate structure | M1 | DONE | Survey |
| 3 | Live GSC Client Integration | Authenticate using `google.auth.GoogleAuth` with scope `https://www.googleapis.com/auth/webmasters` and initialize searchconsole v1 | M1 | DONE | Spec Miner |
| 4 | Site Registration & Verification | Call `sites.add` with normalized URL `https://sih-ouce.meetthealtezza.tech/` and handle existing/conflict states | M1 | DONE | Spec Miner |
| 5 | Sitemap Submission & Verification | Call `sitemaps.submit` for `https://sih-ouce.meetthealtezza.tech/sitemap.xml` and query `sitemaps.get` for confirmation | M1 | DONE | Spec Miner |
| 6 | Robust Error & Permission Diagnostics | Specific error handling for 401 (bad key), 403 (unverified owner / API disabled in GCP), 404, 429 | M1 | DONE | Spec Miner |
| 7 | Dual-Mode & Mock Client Harness | Offline simulation mode (`--dry-run`) and `MockGscClient` for isolated testing | M1 | DONE | Explorer 2 |
| 8 | CLI Interface & Logging | Zero-dependency CLI flags (`--dry-run`, `--credentials`, `--site-url`, `--sitemap-url`, `--verbose`, `--help`) | M1 | DONE | Explorer 2 |
| 9 | Comprehensive Test Suite | Native `node:test` suite covering config, mock client, service logic, error branches, and CLI execution (100 tests) | M1 | DONE | Explorer 2 / Challengers |
| 10 | Security & Git Protection | Update `.gitignore` to prevent leaking credentials and provide `gsc-credentials.sample.json` and `.env.example` updates | M1 | DONE | Explorer 1 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Full GSC Integration & Verification Suite | Implement dependencies, configuration, GSC client, workflow service, CLI entry point, sample configs, `.gitignore`, and unit/integration tests | none | DONE |

## Interface Contracts

### `scripts/lib/gsc-config.js`
- `loadConfig(cliArgs?: string[], env?: NodeJS.ProcessEnv): Promise<GscConfig>`
  - Returns `{ siteUrl: string, sitemapUrl: string, credentialsPath?: string, credentials?: object, dryRun: boolean, verbose: boolean, help: boolean }`
  - Throws descriptive errors on invalid URLs or missing credentials (when not in dry-run mode).

### `scripts/lib/gsc-client.js`
- `createGscClient(config: GscConfig): Promise<IGscClient>`
- `IGscClient`:
  - `addSite(siteUrl: string): Promise<{ success: boolean, status: number, message: string }>`
  - `getSite(siteUrl: string): Promise<{ siteUrl: string, permissionLevel?: string } | null>`
  - `submitSitemap(siteUrl: string, feedpath: string): Promise<{ success: boolean, status: number, message: string }>`
  - `getSitemap(siteUrl: string, feedpath: string): Promise<{ path: string, lastSubmitted?: string, isPending?: boolean, errors?: number }>`

### `scripts/lib/gsc-service.js`
- `extractHttpStatus(err: any): number | string | null`
- `formatApiError(err: any, logger: ILogger, config?: GscConfig): void`
- `runGscWorkflow(options: { config: GscConfig, client: IGscClient, logger: ILogger }): Promise<GscWorkflowResult>`
  - Executes site addition, sitemap submission, and verification check.
  - Returns summary object `{ siteAdded: boolean, sitemapSubmitted: boolean, sitemapStatus: object }`.

## Code Layout
```text
scripts/
├── gsc-submit.js                   # CLI executable entry point
└── lib/
    ├── gsc-config.js               # Credential resolution & config parser
    ├── gsc-client.js               # Live and Mock GSC Client implementations
    ├── gsc-service.js              # Business logic workflow & error diagnostics
    └── gsc-logger.js               # Console formatter
tests/
└── gsc/
    ├── adversarial.test.js         # Adversarial edge cases & boundary inputs (45 tests)
    ├── empirical-challenge.test.js # Idempotency, precedence & Gaxios error tests (13 tests)
    ├── config.test.js              # Configuration & validation tests (21 tests)
    ├── service.test.js             # Service logic & error handling tests (7 tests)
    ├── mock-client.test.js         # Mock client behavior tests (4 tests)
    └── cli.test.js                 # CLI end-to-end execution tests (6 tests)
gsc-credentials.sample.json         # Sample service account key structure
.env.example                        # Documented GSC environment variables
package.json                        # Dependencies (googleapis) & npm scripts ("gsc:submit", "test:gsc")
.gitignore                          # Ignored credential files
```
