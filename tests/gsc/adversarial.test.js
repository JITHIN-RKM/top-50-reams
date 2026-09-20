import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  normalizeSiteUrl,
  validateSitemapUrl,
  normalizePrivateKey,
  validateCredentialsObject,
  resolveCredentials,
  parseCliArgs,
  loadConfig,
} from '../../scripts/lib/gsc-config.js';
import { MockGscClient } from '../../scripts/lib/gsc-client.js';
import { runGscWorkflow, formatApiError } from '../../scripts/lib/gsc-service.js';
import { GscLogger } from '../../scripts/lib/gsc-logger.js';
import { main } from '../../scripts/gsc-submit.js';

const execFileAsync = promisify(execFile);
const CLI_PATH = path.resolve(process.cwd(), 'scripts/gsc-submit.js');

describe('Adversarial & Stress Test Suite: Google Search Console Submission', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsc-adversarial-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  function createLogCollector() {
    const logs = [];
    const logger = new GscLogger({
      outputFn: (msg) => logs.push({ type: 'out', msg }),
      errorFn: (msg) => logs.push({ type: 'err', msg }),
      colors: false,
    });
    return { logger, logs };
  }

  // =========================================================================
  // 1. Boundary conditions & Edge Cases: Malformed Credentials
  // =========================================================================
  describe('Boundary: Malformed Credentials & Missing Fields', () => {
    it('should reject non-existent credentials path', () => {
      const nonExistent = path.join(tmpDir, 'void.json');
      const res = resolveCredentials({ explicitPath: nonExistent, env: {} });
      assert.ok(res.error);
      assert.ok(res.error.includes('Credentials file not found'));
    });

    it('should reject file containing non-JSON corrupted syntax', () => {
      const filePath = path.join(tmpDir, 'corrupt.json');
      fs.writeFileSync(filePath, '{ "client_email": "test@domain.com", "private_key": ');
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
      assert.ok(res.error.includes('Failed to parse credentials JSON file'));
    });

    it('should reject file containing JSON null', () => {
      const filePath = path.join(tmpDir, 'null.json');
      fs.writeFileSync(filePath, 'null');
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
    });

    it('should reject file containing JSON primitive string', () => {
      const filePath = path.join(tmpDir, 'string.json');
      fs.writeFileSync(filePath, '"just-a-raw-string"');
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
    });

    it('should reject file containing JSON number', () => {
      const filePath = path.join(tmpDir, 'number.json');
      fs.writeFileSync(filePath, '987654321');
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
    });

    it('should reject file containing JSON array', () => {
      const filePath = path.join(tmpDir, 'array.json');
      fs.writeFileSync(filePath, '["client_email", "private_key"]');
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
    });

    it('should reject credentials missing client_email', () => {
      const filePath = path.join(tmpDir, 'no-email.json');
      fs.writeFileSync(
        filePath,
        JSON.stringify({ private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----' })
      );
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
      assert.ok(res.error.includes('missing required \'client_email\' or \'private_key\''));
    });

    it('should reject credentials with invalid client_email format (no @)', () => {
      const filePath = path.join(tmpDir, 'invalid-email.json');
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          client_email: 'not-an-email-address',
          private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
        })
      );
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
    });

    it('should reject credentials missing private_key', () => {
      const filePath = path.join(tmpDir, 'no-key.json');
      fs.writeFileSync(
        filePath,
        JSON.stringify({ client_email: 'sa@test-project.iam.gserviceaccount.com' })
      );
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
      assert.ok(res.error.includes('missing required \'client_email\' or \'private_key\''));
    });

    it('should reject credentials with invalid private_key format (missing marker)', () => {
      const filePath = path.join(tmpDir, 'invalid-key.json');
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          client_email: 'sa@test-project.iam.gserviceaccount.com',
          private_key: 'secret-token-without-pem-headers',
        })
      );
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error);
    });

    it('should reject malformed inline GSC_CREDENTIALS_JSON env var', () => {
      const res = resolveCredentials({ env: { GSC_CREDENTIALS_JSON: '{ broken json' } });
      assert.ok(res.error);
      assert.ok(res.error.includes('Failed to parse inline GSC_CREDENTIALS_JSON'));
    });

    it('should reject inline GSC_CREDENTIALS_JSON missing private_key', () => {
      const res = resolveCredentials({
        env: { GSC_CREDENTIALS_JSON: JSON.stringify({ client_email: 'sa@project.iam.gserviceaccount.com' }) },
      });
      assert.ok(res.error);
      assert.ok(res.error.includes('missing required \'client_email\' or \'private_key\''));
    });

    it('should reject partial individual env vars when only GSC_CLIENT_EMAIL is set', () => {
      const res = resolveCredentials({
        env: { GSC_CLIENT_EMAIL: 'sa@project.iam.gserviceaccount.com' },
      });
      assert.equal(res.credentials, undefined);
    });

    it('should reject partial individual env vars when only GSC_PRIVATE_KEY is set', () => {
      const res = resolveCredentials({
        env: { GSC_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----' },
      });
      assert.equal(res.credentials, undefined);
    });

    it('should reject GSC_CREDENTIALS_PATH pointing to non-existent path', () => {
      const res = resolveCredentials({
        env: { GSC_CREDENTIALS_PATH: './non-existent-path-1234.json' },
      });
      assert.ok(res.error);
      assert.ok(res.error.includes('Credentials file from environment path not found'));
    });
  });

  // =========================================================================
  // 2. URL Schemas, Normalization, Mismatches, Trailing Slashes
  // =========================================================================
  describe('Boundary: URL Schemas, Normalization & Domain Mismatches', () => {
    it('should reject empty, null, and non-string inputs in normalizeSiteUrl', () => {
      assert.throws(() => normalizeSiteUrl(''), /Site URL is required/);
      assert.throws(() => normalizeSiteUrl(null), /Site URL is required/);
      assert.throws(() => normalizeSiteUrl(undefined), /Site URL is required/);
      assert.throws(() => normalizeSiteUrl(12345), /Site URL is required/);
      assert.throws(() => normalizeSiteUrl({}), /Site URL is required/);
    });

    it('should reject non-HTTP/HTTPS protocols in normalizeSiteUrl', () => {
      assert.throws(() => normalizeSiteUrl('javascript:alert(1)'), /Invalid Site URL protocol/);
      assert.throws(() => normalizeSiteUrl('file:///etc/passwd'), /Invalid Site URL protocol/);
      assert.throws(() => normalizeSiteUrl('data:text/html,<h1>test</h1>'), /Invalid Site URL protocol/);
      assert.throws(() => normalizeSiteUrl('ftp://ftp.example.com/'), /Invalid Site URL protocol/);
      assert.throws(() => normalizeSiteUrl('ssh://git@github.com'), /Invalid Site URL protocol/);
    });

    it('should reject severely malformed URL strings in normalizeSiteUrl', () => {
      assert.throws(() => normalizeSiteUrl('https://'), /Invalid Site URL/);
      assert.throws(() => normalizeSiteUrl('http://:80'), /Invalid Site URL/);
      assert.throws(() => normalizeSiteUrl('ht tp://spaces.com'), /Invalid Site URL/);
    });

    it('should append trailing slash when root domain lacks trailing slash', () => {
      const input = 'https://sih-ouce.meetthealtezza.tech';
      const normalized = normalizeSiteUrl(input);
      assert.equal(normalized, 'https://sih-ouce.meetthealtezza.tech/');
    });

    it('should maintain existing trailing slash when already present', () => {
      const input = 'https://sih-ouce.meetthealtezza.tech/';
      const normalized = normalizeSiteUrl(input);
      assert.equal(normalized, 'https://sih-ouce.meetthealtezza.tech/');
    });

    it('should handle URLs with port numbers correctly', () => {
      const input = 'https://localhost:8443';
      const normalized = normalizeSiteUrl(input);
      assert.equal(normalized, 'https://localhost:8443/');
    });

    it('should reject empty, null, and non-string inputs in validateSitemapUrl', () => {
      const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';
      assert.throws(() => validateSitemapUrl('', siteUrl), /Sitemap URL is required/);
      assert.throws(() => validateSitemapUrl(null, siteUrl), /Sitemap URL is required/);
      assert.throws(() => validateSitemapUrl(undefined, siteUrl), /Sitemap URL is required/);
    });

    it('should reject sitemap URL on a different domain', () => {
      const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';
      const sitemap = 'https://google.com/sitemap.xml';
      assert.throws(() => validateSitemapUrl(sitemap, siteUrl), /Sitemap origin mismatch/);
    });

    it('should reject sitemap URL on a different subdomain', () => {
      const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';
      const sitemap = 'https://api.meetthealtezza.tech/sitemap.xml';
      assert.throws(() => validateSitemapUrl(sitemap, siteUrl), /Sitemap origin mismatch/);
    });

    it('should reject sitemap URL with protocol mismatch (http vs https)', () => {
      const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';
      const sitemap = 'http://sih-ouce.meetthealtezza.tech/sitemap.xml';
      assert.throws(() => validateSitemapUrl(sitemap, siteUrl), /Sitemap origin mismatch/);
    });

    it('should reject sitemap URL with port mismatch', () => {
      const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';
      const sitemap = 'https://sih-ouce.meetthealtezza.tech:8080/sitemap.xml';
      assert.throws(() => validateSitemapUrl(sitemap, siteUrl), /Sitemap origin mismatch/);
    });

    it('should accept valid sitemap with subdirectories and nested paths', () => {
      const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';
      const sitemap = 'https://sih-ouce.meetthealtezza.tech/nested/dir/sitemap_index.xml';
      assert.equal(validateSitemapUrl(sitemap, siteUrl), sitemap);
    });
  });

  // =========================================================================
  // 3. CLI Execution Under Unexpected Arguments & Environment States
  // =========================================================================
  describe('Adversarial: CLI Arguments & Environment Stress', () => {
    it('should reject unknown flags gracefully via parseCliArgs and main()', async () => {
      assert.throws(() => parseCliArgs(['--unknown-flag']), /CLI argument error/);

      const res = await main(['--unknown-flag']);
      assert.equal(res.success, false);
      assert.equal(res.exitCode, 1);
      assert.ok(res.error.message.includes('CLI argument error'));
    });

    it('should reject unexpected positional arguments', async () => {
      assert.throws(() => parseCliArgs(['unexpected-positional-arg']), /CLI argument error/);

      const res = await main(['unexpected-positional-arg']);
      assert.equal(res.success, false);
      assert.equal(res.exitCode, 1);
    });

    it('should respect GSC_DRY_RUN environment variables (true, 1, false, 0)', async () => {
      // GSC_DRY_RUN=1
      const config1 = await loadConfig([], { GSC_DRY_RUN: '1' });
      assert.equal(config1.dryRun, true);

      // GSC_DRY_RUN=true
      const config2 = await loadConfig([], { GSC_DRY_RUN: 'true' });
      assert.equal(config2.dryRun, true);

      // GSC_DRY_RUN=false (without credentials should throw)
      await assert.rejects(async () => {
        await loadConfig([], { GSC_DRY_RUN: 'false' });
      }, /Missing Google Service Account credentials/);

      // GSC_DRY_RUN=0 (without credentials should throw)
      await assert.rejects(async () => {
        await loadConfig([], { GSC_DRY_RUN: '0' });
      }, /Missing Google Service Account credentials/);
    });

    it('should respect GSC_VERBOSE environment variable', async () => {
      const config1 = await loadConfig(['--dry-run'], { GSC_VERBOSE: '1' });
      assert.equal(config1.verbose, true);

      const config2 = await loadConfig(['--dry-run'], { GSC_VERBOSE: 'true' });
      assert.equal(config2.verbose, true);

      const config3 = await loadConfig(['--dry-run'], { GSC_VERBOSE: 'false' });
      assert.equal(config3.verbose, false);
    });

    it('should allow CLI flags to override environment variables', async () => {
      const config = await loadConfig(
        [
          '--site-url=https://override.example.com/',
          '--sitemap-url=https://override.example.com/sitemap.xml',
          '--dry-run',
        ],
        {
          GSC_SITE_URL: 'https://env.example.com/',
          GSC_SITEMAP_URL: 'https://env.example.com/sitemap.xml',
        }
      );

      assert.equal(config.siteUrl, 'https://override.example.com/');
      assert.equal(config.sitemapUrl, 'https://override.example.com/sitemap.xml');
    });

    it('should handle NO_COLOR environment variable in GscLogger', () => {
      const loggerColored = new GscLogger({ colors: true });
      const colored = loggerColored.colorize('green', 'test');
      assert.ok(colored.includes('\x1b[32m'));

      const loggerNoColor = new GscLogger({ colors: false });
      const uncolored = loggerNoColor.colorize('green', 'test');
      assert.equal(uncolored, 'test');
    });
  });

  // =========================================================================
  // 4. Simulated API Errors & Network Resilience
  // =========================================================================
  describe('Empirical: Simulated API Errors & Network Failures', () => {
    const config = {
      siteUrl: 'https://sih-ouce.meetthealtezza.tech/',
      sitemapUrl: 'https://sih-ouce.meetthealtezza.tech/sitemap.xml',
      clientEmail: 'test-sa@project.iam.gserviceaccount.com',
      dryRun: true,
      verbose: true,
    };

    it('should handle 401 Unauthorized cleanly with diagnostics', async () => {
      const client = new MockGscClient(config);
      client.setSimulatedError('addSite', {
        status: 401,
        message: 'Request had invalid authentication credentials. Expected OAuth 2 access token.',
      });
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.status, 401);
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('401 UNAUTHORIZED'));
      assert.ok(errText.includes('private_key'));
    });

    it('should handle 403 Forbidden with exact action instructions', async () => {
      const client = new MockGscClient(config);
      client.setSimulatedError('submitSitemap', {
        status: 403,
        message: 'User does not have sufficient permissions for site "https://sih-ouce.meetthealtezza.tech/".',
      });
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.status, 403);
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('403 FORBIDDEN'));
      assert.ok(errText.includes('ACTION REQUIRED: Delegate Search Console Ownership'));
      assert.ok(errText.includes(config.clientEmail));
      assert.ok(errText.includes('Settings > Users and permissions > Add user'));
    });

    it('should handle 404 Not Found cleanly with property format advice', async () => {
      const client = new MockGscClient(config);
      client.setSimulatedError('addSite', {
        status: 404,
        message: 'Site not found.',
      });
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.status, 404);
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('404 NOT FOUND'));
      assert.ok(errText.includes('trailing slash'));
    });

    it('should handle 500 Internal Server Error cleanly without crashing', async () => {
      const client = new MockGscClient(config);
      client.setSimulatedError('addSite', {
        status: 500,
        message: 'Backend Error / Internal Server Error on Google Cloud Search Console API.',
      });
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.status, 500);
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('API Error (500)'));
      assert.ok(errText.includes('Backend Error'));
    });

    it('should handle 503 Service Unavailable', async () => {
      const client = new MockGscClient(config);
      client.setSimulatedError('submitSitemap', {
        status: 503,
        message: 'The service is temporarily unavailable.',
      });
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.status, 503);
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('API Error (503)'));
    });

    it('should handle Network Error ECONNREFUSED cleanly', async () => {
      const netError = new Error('connect ECONNREFUSED 142.250.190.42:443');
      netError.code = 'ECONNREFUSED';

      const client = new MockGscClient(config);
      client.setSimulatedError('addSite', netError);
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.code, 'ECONNREFUSED');
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('ECONNREFUSED'));
    });

    it('should handle Network Error ETIMEDOUT cleanly', async () => {
      const timeoutError = new Error('Connection timed out to searchconsole.googleapis.com');
      timeoutError.code = 'ETIMEDOUT';

      const client = new MockGscClient(config);
      client.setSimulatedError('submitSitemap', timeoutError);
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.code, 'ETIMEDOUT');
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('ETIMEDOUT'));
    });

    it('should handle Network Error ENOTFOUND (DNS resolution failure)', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND searchconsole.googleapis.com');
      dnsError.code = 'ENOTFOUND';

      const client = new MockGscClient(config);
      client.setSimulatedError('addSite', dnsError);
      const { logger, logs } = createLogCollector();

      await assert.rejects(
        async () => {
          await runGscWorkflow({ config, client, logger });
        },
        (err) => {
          assert.equal(err.code, 'ENOTFOUND');
          return true;
        }
      );

      const errText = logs.map((l) => l.msg).join('\n');
      assert.ok(errText.includes('ENOTFOUND'));
    });
  });

  // =========================================================================
  // 5. Child Process End-to-End Adversarial Tests
  // =========================================================================
  describe('Adversarial: CLI Child Process Invocations', () => {
    it('should exit with code 1 and log error when unknown flag is provided', async () => {
      await assert.rejects(
        async () => {
          await execFileAsync(process.execPath, [CLI_PATH, '--invalid-flag-123']);
        },
        (err) => {
          assert.equal(err.code, 1);
          assert.ok(err.stderr.includes('Configuration Error') || err.stdout.includes('Configuration Error'));
          assert.ok(err.stderr.includes('Unknown option') || err.stdout.includes('Unknown option'));
          return true;
        }
      );
    });

    it('should exit with code 1 and log error when credentials file is malformed JSON', async () => {
      const badCredFile = path.join(tmpDir, 'cli-bad-cred.json');
      fs.writeFileSync(badCredFile, '{ invalid json');

      await assert.rejects(
        async () => {
          await execFileAsync(process.execPath, [CLI_PATH, `--credentials=${badCredFile}`]);
        },
        (err) => {
          assert.equal(err.code, 1);
          assert.ok(err.stderr.includes('Failed to parse credentials JSON') || err.stdout.includes('Failed to parse credentials JSON'));
          return true;
        }
      );
    });

    it('should exit with code 1 and log error when missing credentials in live mode', async () => {
      await assert.rejects(
        async () => {
          await execFileAsync(process.execPath, [CLI_PATH], {
            env: { ...process.env, GSC_DRY_RUN: '0', GSC_CREDENTIALS_PATH: '' },
          });
        },
        (err) => {
          assert.equal(err.code, 1);
          assert.ok(err.stderr.includes('Missing Google Service Account credentials') || err.stdout.includes('Missing Google Service Account credentials'));
          return true;
        }
      );
    });

    it('should exit with code 0 in dry-run mode with custom valid site and sitemap URLs', async () => {
      const { stdout } = await execFileAsync(process.execPath, [
        CLI_PATH,
        '--dry-run',
        '--site-url=https://custom-domain.org/',
        '--sitemap-url=https://custom-domain.org/sitemap.xml',
      ]);
      assert.ok(stdout.includes('Target Property: https://custom-domain.org/'));
      assert.ok(stdout.includes('Target Sitemap:  https://custom-domain.org/sitemap.xml'));
      assert.ok(stdout.includes('Google Search Console workflow completed successfully.'));
    });
  });
});
