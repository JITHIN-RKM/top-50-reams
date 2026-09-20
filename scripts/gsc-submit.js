#!/usr/bin/env node

/**
 * Google Search Console CLI Submission Tool
 * Authenticates with Google Search Console API to register site property and submit sitemap.xml.
 */

import { loadConfig, DEFAULT_SITE_URL, DEFAULT_SITEMAP_URL } from './lib/gsc-config.js';
import { createGscClient } from './lib/gsc-client.js';
import { runGscWorkflow } from './lib/gsc-service.js';
import { createLogger } from './lib/gsc-logger.js';

export function printHelp(logger) {
  logger.box('Google Search Console (GSC) Submission Tool', [
    'Automates property registration and sitemap.xml submission',
    'for https://sih-ouce.meetthealtezza.tech/ using Service Account auth.',
  ]);

  console.log(`
Usage:
  node scripts/gsc-submit.js [options]
  npm run gsc:submit -- [options]

Options:
  -s, --site-url <url>        Target GSC site property URL (default: ${DEFAULT_SITE_URL})
  -m, --sitemap-url <url>     Target sitemap XML URL (default: ${DEFAULT_SITEMAP_URL})
  -c, --credentials <path>    Path to service account JSON key file (default: ./gsc-credentials.json)
  -d, --dry-run               Execute simulation mode without making real API calls
  -v, --verbose               Enable verbose/debug logging output
  -h, --help                  Show this help message and exit

Environment Variables:
  GSC_CREDENTIALS_PATH        Path to service account JSON file
  GOOGLE_APPLICATION_CREDENTIALS Path to service account JSON file
  GSC_CREDENTIALS_JSON        Raw JSON string containing service account credentials
  GSC_CLIENT_EMAIL            Service account client email (used with GSC_PRIVATE_KEY)
  GSC_PRIVATE_KEY             Service account private key
  GSC_SITE_URL                Override default site URL
  GSC_SITEMAP_URL             Override default sitemap URL
  GSC_DRY_RUN                 Set to "true" or "1" for dry run mode
  GSC_VERBOSE                 Set to "true" or "1" for verbose logging

Examples:
  # Test submission in offline dry-run mode:
  node scripts/gsc-submit.js --dry-run

  # Submit with specific credentials file:
  node scripts/gsc-submit.js --credentials=./my-gsc-key.json

  # Run via npm script:
  npm run gsc:submit -- --dry-run --verbose
`);
}

export async function main(args = process.argv.slice(2)) {
  let config;
  const tempLogger = createLogger();

  try {
    config = await loadConfig(args);
  } catch (err) {
    tempLogger.error(`Configuration Error: ${err.message}`);
    return { success: false, exitCode: 1, error: err };
  }

  const logger = createLogger({ verbose: config.verbose });

  if (config.help) {
    printHelp(logger);
    return { success: true, exitCode: 0, help: true };
  }

  try {
    logger.info(`Initializing Google Search Console client...`);
    const client = await createGscClient(config);

    const result = await runGscWorkflow({ config, client, logger });
    logger.success(`Google Search Console workflow completed successfully.`);
    return { success: true, exitCode: 0, result };
  } catch (err) {
    logger.error(`Search Console workflow failed: ${err.message}`);
    return { success: false, exitCode: 1, error: err };
  }
}

// Execute immediately when invoked directly via CLI
const isDirectRun = process.argv[1] && (
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')) ||
  process.argv[1].endsWith('gsc-submit.js')
);

if (isDirectRun) {
  main().then(({ exitCode }) => {
    process.exit(exitCode);
  });
}
