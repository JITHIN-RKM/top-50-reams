import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  normalizeSiteUrl,
  validateSitemapUrl,
  normalizePrivateKey,
  validateCredentialsObject,
  resolveCredentials,
  parseCliArgs,
  loadConfig,
  DEFAULT_SITE_URL,
  DEFAULT_SITEMAP_URL,
} from '../../scripts/lib/gsc-config.js';

describe('GSC Config Module', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsc-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('normalizeSiteUrl', () => {
    it('should add trailing slash to domain root', () => {
      assert.equal(
        normalizeSiteUrl('https://sih-ouce.meetthealtezza.tech'),
        'https://sih-ouce.meetthealtezza.tech/'
      );
    });

    it('should preserve URL with existing trailing slash', () => {
      assert.equal(
        normalizeSiteUrl('https://sih-ouce.meetthealtezza.tech/'),
        'https://sih-ouce.meetthealtezza.tech/'
      );
    });

    it('should preserve subpaths', () => {
      assert.equal(
        normalizeSiteUrl('https://sih-ouce.meetthealtezza.tech/sub/'),
        'https://sih-ouce.meetthealtezza.tech/sub/'
      );
    });

    it('should throw on invalid URL string', () => {
      assert.throws(() => normalizeSiteUrl('not-a-url'), /Invalid Site URL/);
    });

    it('should throw on unsupported protocol (ftp)', () => {
      assert.throws(() => normalizeSiteUrl('ftp://example.com/'), /Invalid Site URL protocol/);
    });

    it('should throw when siteUrl is empty', () => {
      assert.throws(() => normalizeSiteUrl(''), /Site URL is required/);
    });
  });

  describe('validateSitemapUrl', () => {
    const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';

    it('should accept valid matching sitemap URL', () => {
      const sitemap = 'https://sih-ouce.meetthealtezza.tech/sitemap.xml';
      assert.equal(validateSitemapUrl(sitemap, siteUrl), sitemap);
    });

    it('should throw when sitemap origin does not match site origin', () => {
      const wrongOrigin = 'https://other-domain.com/sitemap.xml';
      assert.throws(() => validateSitemapUrl(wrongOrigin, siteUrl), /Sitemap origin mismatch/);
    });

    it('should throw on invalid sitemap URL syntax', () => {
      assert.throws(() => validateSitemapUrl('random-text', siteUrl), /Invalid Sitemap URL/);
    });
  });

  describe('normalizePrivateKey', () => {
    it('should replace literal \\n with actual newlines', () => {
      const raw = '-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgk\\n-----END PRIVATE KEY-----';
      const expected = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk\n-----END PRIVATE KEY-----';
      assert.equal(normalizePrivateKey(raw), expected);
    });

    it('should return empty string for falsy input', () => {
      assert.equal(normalizePrivateKey(null), '');
    });
  });

  describe('validateCredentialsObject', () => {
    it('should return true for valid service account structure', () => {
      const creds = {
        client_email: 'test@project.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      };
      assert.equal(validateCredentialsObject(creds), true);
    });

    it('should return false when client_email is missing or invalid', () => {
      assert.equal(validateCredentialsObject({ private_key: '-----BEGIN PRIVATE KEY-----' }), false);
      assert.equal(validateCredentialsObject({ client_email: 'invalid', private_key: '-----BEGIN PRIVATE KEY-----' }), false);
    });

    it('should return false when private_key is missing or invalid', () => {
      assert.equal(validateCredentialsObject({ client_email: 'test@project.iam.gserviceaccount.com' }), false);
      assert.equal(validateCredentialsObject({ client_email: 'test@project.iam.gserviceaccount.com', private_key: 'bad-key' }), false);
    });
  });

  describe('resolveCredentials', () => {
    it('should load credentials from a valid file path', () => {
      const filePath = path.join(tmpDir, 'test-creds.json');
      const creds = {
        client_email: 'test-sa@project.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\\nfake_rsa\\n-----END PRIVATE KEY-----',
      };
      fs.writeFileSync(filePath, JSON.stringify(creds));

      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.equal(res.error, undefined);
      assert.equal(res.clientEmail, 'test-sa@project.iam.gserviceaccount.com');
      assert.ok(res.credentials.private_key.includes('\nfake_rsa\n'));
    });

    it('should return error for non-existent file path', () => {
      const nonExistent = path.join(tmpDir, 'does-not-exist.json');
      const res = resolveCredentials({ explicitPath: nonExistent, env: {} });
      assert.ok(res.error.includes('not found'));
    });

    it('should return error for malformed JSON file', () => {
      const filePath = path.join(tmpDir, 'bad.json');
      fs.writeFileSync(filePath, '{ invalid json');
      const res = resolveCredentials({ explicitPath: filePath, env: {} });
      assert.ok(res.error.includes('Failed to parse credentials JSON'));
    });

    it('should load from inline GSC_CREDENTIALS_JSON env variable', () => {
      const creds = {
        client_email: 'inline-sa@project.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      };
      const res = resolveCredentials({ env: { GSC_CREDENTIALS_JSON: JSON.stringify(creds) } });
      assert.equal(res.error, undefined);
      assert.equal(res.clientEmail, 'inline-sa@project.iam.gserviceaccount.com');
    });

    it('should load from GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY env vars', () => {
      const res = resolveCredentials({
        env: {
          GSC_CLIENT_EMAIL: 'env-sa@project.iam.gserviceaccount.com',
          GSC_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----',
        },
      });
      assert.equal(res.error, undefined);
      assert.equal(res.clientEmail, 'env-sa@project.iam.gserviceaccount.com');
      assert.ok(res.credentials.private_key.includes('\nkey\n'));
    });
  });

  describe('parseCliArgs', () => {
    it('should parse short options', () => {
      const parsed = parseCliArgs(['-s', 'https://example.com/', '-m', 'https://example.com/sitemap.xml', '-d', '-v']);
      assert.equal(parsed['site-url'], 'https://example.com/');
      assert.equal(parsed['sitemap-url'], 'https://example.com/sitemap.xml');
      assert.equal(parsed['dry-run'], true);
      assert.equal(parsed['verbose'], true);
    });

    it('should parse long options', () => {
      const parsed = parseCliArgs([
        '--site-url=https://custom.com/',
        '--sitemap-url=https://custom.com/sitemap.xml',
        '--credentials=./key.json',
        '--dry-run',
        '--help',
      ]);
      assert.equal(parsed['site-url'], 'https://custom.com/');
      assert.equal(parsed['sitemap-url'], 'https://custom.com/sitemap.xml');
      assert.equal(parsed['credentials'], './key.json');
      assert.equal(parsed['dry-run'], true);
      assert.equal(parsed['help'], true);
    });
  });

  describe('loadConfig', () => {
    it('should return defaults with dry-run mode enabled', async () => {
      const config = await loadConfig(['--dry-run'], {});
      assert.equal(config.siteUrl, DEFAULT_SITE_URL);
      assert.equal(config.sitemapUrl, DEFAULT_SITEMAP_URL);
      assert.equal(config.dryRun, true);
      assert.equal(config.help, false);
    });

    it('should return help: true when --help is passed', async () => {
      const config = await loadConfig(['--help'], {});
      assert.equal(config.help, true);
    });

    it('should throw when running in live mode without credentials', async () => {
      await assert.rejects(
        async () => {
          await loadConfig([], {});
        },
        /Missing Google Service Account credentials/
      );
    });

    it('should successfully load config when valid credentials provided in live mode', async () => {
      const filePath = path.join(tmpDir, 'valid-creds.json');
      const creds = {
        client_email: 'live-sa@project.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----',
      };
      fs.writeFileSync(filePath, JSON.stringify(creds));

      const config = await loadConfig(['--credentials', filePath], {});
      assert.equal(config.dryRun, false);
      assert.equal(config.clientEmail, 'live-sa@project.iam.gserviceaccount.com');
      assert.equal(config.credentialsPath, filePath);
    });
  });
});
