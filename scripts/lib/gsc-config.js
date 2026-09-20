import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

export const DEFAULT_SITE_URL = 'https://sih-ouce.meetthealtezza.tech/';
export const DEFAULT_SITEMAP_URL = 'https://sih-ouce.meetthealtezza.tech/sitemap.xml';
export const DEFAULT_CREDENTIALS_FILE = './gsc-credentials.json';

/**
 * Normalize site URL ensuring valid protocol and trailing slash for domain root.
 * @param {string} rawUrl
 * @returns {string}
 */
export function normalizeSiteUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Site URL is required and must be a string.');
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (err) {
    throw new Error(`Invalid Site URL: "${rawUrl}". Must be a valid absolute URL (e.g. https://example.com/).`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Invalid Site URL protocol "${parsed.protocol}". Must be http: or https:.`);
  }

  // Ensure trailing slash for root URL-prefix properties in GSC
  if (parsed.pathname === '') {
    parsed.pathname = '/';
  }

  return parsed.toString();
}

/**
 * Validate sitemap URL and ensure it belongs to the site origin.
 * @param {string} rawUrl
 * @param {string} normalizedSiteUrl
 * @returns {string}
 */
export function validateSitemapUrl(rawUrl, normalizedSiteUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Sitemap URL is required and must be a string.');
  }

  let parsedSitemap;
  try {
    parsedSitemap = new URL(rawUrl);
  } catch (err) {
    throw new Error(`Invalid Sitemap URL: "${rawUrl}". Must be a valid absolute URL.`);
  }

  if (parsedSitemap.protocol !== 'http:' && parsedSitemap.protocol !== 'https:') {
    throw new Error(`Invalid Sitemap URL protocol "${parsedSitemap.protocol}". Must be http: or https:.`);
  }

  const siteOrigin = new URL(normalizedSiteUrl).origin;
  if (parsedSitemap.origin !== siteOrigin) {
    throw new Error(
      `Sitemap origin mismatch: "${parsedSitemap.origin}" does not match site origin "${siteOrigin}". ` +
      `Google Search Console requires the sitemap to be hosted under the target property.`
    );
  }

  return parsedSitemap.toString();
}

/**
 * Clean private key string (handling literal escaped newlines from env vars).
 * @param {string} key
 * @returns {string}
 */
export function normalizePrivateKey(key) {
  if (!key || typeof key !== 'string') return '';
  return key.replace(/\\n/g, '\n');
}

/**
 * Validate service account credentials object.
 * @param {any} creds
 * @returns {boolean}
 */
export function validateCredentialsObject(creds) {
  if (!creds || typeof creds !== 'object') {
    return false;
  }
  if (typeof creds.client_email !== 'string' || !creds.client_email.includes('@')) {
    return false;
  }
  if (typeof creds.private_key !== 'string' || !creds.private_key.includes('PRIVATE KEY')) {
    return false;
  }
  return true;
}

/**
 * Resolves credentials from file, inline JSON, or env vars.
 * @param {Object} params
 * @param {string} [params.explicitPath]
 * @param {NodeJS.ProcessEnv} [params.env]
 * @returns {{ credentials?: Object, credentialsPath?: string, clientEmail?: string, error?: string }}
 */
export function resolveCredentials({ explicitPath, env = process.env } = {}) {
  // 1. Check explicit file path if provided
  if (explicitPath) {
    const resolved = path.resolve(process.cwd(), explicitPath);
    if (!fs.existsSync(resolved)) {
      return { error: `Credentials file not found at: ${resolved}` };
    }
    try {
      const content = fs.readFileSync(resolved, 'utf8');
      const json = JSON.parse(content);
      if (json.private_key) {
        json.private_key = normalizePrivateKey(json.private_key);
      }
      if (!validateCredentialsObject(json)) {
        return { error: `Credentials file at ${resolved} is missing required 'client_email' or 'private_key' fields.` };
      }
      return { credentials: json, credentialsPath: resolved, clientEmail: json.client_email };
    } catch (err) {
      return { error: `Failed to parse credentials JSON file at ${resolved}: ${err.message}` };
    }
  }

  // 2. Check inline JSON in environment variable (GSC_CREDENTIALS_JSON or GOOGLE_SERVICE_ACCOUNT_KEY)
  const inlineJson = env.GSC_CREDENTIALS_JSON || env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (inlineJson) {
    try {
      const json = JSON.parse(inlineJson);
      if (json.private_key) {
        json.private_key = normalizePrivateKey(json.private_key);
      }
      if (!validateCredentialsObject(json)) {
        return { error: `Inline GSC_CREDENTIALS_JSON is missing required 'client_email' or 'private_key' fields.` };
      }
      return { credentials: json, clientEmail: json.client_email };
    } catch (err) {
      return { error: `Failed to parse inline GSC_CREDENTIALS_JSON: ${err.message}` };
    }
  }

  // 3. Check individual env variables (GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY)
  if (env.GSC_CLIENT_EMAIL && env.GSC_PRIVATE_KEY) {
    const json = {
      type: 'service_account',
      client_email: env.GSC_CLIENT_EMAIL.trim(),
      private_key: normalizePrivateKey(env.GSC_PRIVATE_KEY.trim()),
      project_id: env.GSC_PROJECT_ID || 'gsc-automation',
    };
    if (!validateCredentialsObject(json)) {
      return { error: `GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY is invalid.` };
    }
    return { credentials: json, clientEmail: json.client_email };
  }

  // 4. Check env path variables (GSC_CREDENTIALS_PATH or GOOGLE_APPLICATION_CREDENTIALS)
  const envPath = env.GSC_CREDENTIALS_PATH || env.GOOGLE_APPLICATION_CREDENTIALS || env.GSC_CREDENTIALS_FILE;
  if (envPath) {
    const resolved = path.resolve(process.cwd(), envPath);
    if (!fs.existsSync(resolved)) {
      return { error: `Credentials file from environment path not found at: ${resolved}` };
    }
    try {
      const content = fs.readFileSync(resolved, 'utf8');
      const json = JSON.parse(content);
      if (json.private_key) {
        json.private_key = normalizePrivateKey(json.private_key);
      }
      if (!validateCredentialsObject(json)) {
        return { error: `Credentials file at ${resolved} is missing required 'client_email' or 'private_key' fields.` };
      }
      return { credentials: json, credentialsPath: resolved, clientEmail: json.client_email };
    } catch (err) {
      return { error: `Failed to parse credentials JSON file at ${resolved}: ${err.message}` };
    }
  }

  // 5. Check default fallback file in root: ./gsc-credentials.json
  const defaultFile = path.resolve(process.cwd(), DEFAULT_CREDENTIALS_FILE);
  if (fs.existsSync(defaultFile)) {
    try {
      const content = fs.readFileSync(defaultFile, 'utf8');
      const json = JSON.parse(content);
      if (json.private_key) {
        json.private_key = normalizePrivateKey(json.private_key);
      }
      if (validateCredentialsObject(json)) {
        return { credentials: json, credentialsPath: defaultFile, clientEmail: json.client_email };
      }
    } catch {
      // Ignored for default fallback check
    }
  }

  return {};
}

/**
 * Parse CLI arguments using node:util.parseArgs
 * @param {string[]} [args]
 * @returns {Object}
 */
export function parseCliArgs(args = process.argv.slice(2)) {
  const options = {
    'site-url': { type: 'string', short: 's' },
    'sitemap-url': { type: 'string', short: 'm' },
    'credentials': { type: 'string', short: 'c' },
    'dry-run': { type: 'boolean', short: 'd' },
    'verbose': { type: 'boolean', short: 'v' },
    'help': { type: 'boolean', short: 'h' },
  };

  try {
    const { values } = parseArgs({ args, options, allowPositionals: false });
    return values;
  } catch (err) {
    throw new Error(`CLI argument error: ${err.message}`);
  }
}

/**
 * Load, resolve, and validate complete GSC configuration.
 * @param {string[]} [cliArgs]
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Promise<Object>}
 */
export async function loadConfig(cliArgs = process.argv.slice(2), env = process.env) {
  // Load .env or .env.local if native helper exists
  if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile('.env'); } catch {}
    try { process.loadEnvFile('.env.local'); } catch {}
  }

  const cli = parseCliArgs(cliArgs);

  const help = Boolean(cli.help);
  if (help) {
    return {
      help: true,
      siteUrl: DEFAULT_SITE_URL,
      sitemapUrl: DEFAULT_SITEMAP_URL,
      dryRun: false,
      verbose: false,
    };
  }

  const rawSiteUrl = cli['site-url'] || env.GSC_SITE_URL || DEFAULT_SITE_URL;
  const siteUrl = normalizeSiteUrl(rawSiteUrl);

  const rawSitemapUrl = cli['sitemap-url'] || env.GSC_SITEMAP_URL || DEFAULT_SITEMAP_URL;
  const sitemapUrl = validateSitemapUrl(rawSitemapUrl, siteUrl);

  const dryRun = cli['dry-run'] !== undefined ? cli['dry-run'] : (env.GSC_DRY_RUN === 'true' || env.GSC_DRY_RUN === '1');
  const verbose = cli['verbose'] !== undefined ? cli['verbose'] : (env.GSC_VERBOSE === 'true' || env.GSC_VERBOSE === '1');

  const credResolution = resolveCredentials({
    explicitPath: cli.credentials,
    env,
  });

  if (credResolution.error && !dryRun) {
    throw new Error(credResolution.error);
  }

  if (!credResolution.credentials && !dryRun) {
    throw new Error(
      'Missing Google Service Account credentials. You must provide credentials via one of:\n' +
      '  1. CLI flag: --credentials=./gsc-credentials.json (or -c path)\n' +
      '  2. Environment variable: GSC_CREDENTIALS_PATH or GOOGLE_APPLICATION_CREDENTIALS\n' +
      '  3. Inline JSON env var: GSC_CREDENTIALS_JSON\n' +
      '  4. Individual env vars: GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY\n' +
      '  5. Default file: ./gsc-credentials.json\n' +
      '  (Or pass --dry-run / -d to test without credentials).'
    );
  }

  return {
    siteUrl,
    sitemapUrl,
    credentialsPath: credResolution.credentialsPath,
    credentials: credResolution.credentials,
    clientEmail: credResolution.clientEmail || credResolution.credentials?.client_email || 'dry-run@serviceaccount.local',
    dryRun,
    verbose,
    help: false,
  };
}
