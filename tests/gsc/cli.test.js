import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { main } from '../../scripts/gsc-submit.js';

const execFileAsync = promisify(execFile);
const CLI_PATH = path.resolve(process.cwd(), 'scripts/gsc-submit.js');

describe('GSC CLI Entry Point', () => {
  it('should return exit code 0 on --help', async () => {
    const res = await main(['--help']);
    assert.equal(res.exitCode, 0);
    assert.equal(res.help, true);
  });

  it('should return exit code 0 on --dry-run', async () => {
    const res = await main(['--dry-run']);
    assert.equal(res.exitCode, 0);
    assert.equal(res.success, true);
    assert.ok(res.result);
    assert.equal(res.result.siteAdded, true);
    assert.equal(res.result.sitemapSubmitted, true);
  });

  it('should return exit code 1 when given an invalid site URL', async () => {
    const res = await main(['--site-url', 'not-a-valid-url']);
    assert.equal(res.exitCode, 1);
    assert.equal(res.success, false);
    assert.ok(res.error.message.includes('Invalid Site URL'));
  });

  it('should return exit code 1 when credentials file is missing in live mode', async () => {
    const res = await main(['--credentials', './non-existent-key.json']);
    assert.equal(res.exitCode, 1);
    assert.equal(res.success, false);
    assert.ok(res.error.message.includes('not found'));
  });

  it('should execute end-to-end as child process in dry-run mode', async () => {
    const { stdout, stderr } = await execFileAsync(process.execPath, [CLI_PATH, '--dry-run', '--verbose']);
    assert.ok(stdout.includes('Target Property: https://sih-ouce.meetthealtezza.tech/'));
    assert.ok(stdout.includes('Target Sitemap:  https://sih-ouce.meetthealtezza.tech/sitemap.xml'));
    assert.ok(stdout.includes('Google Search Console workflow completed successfully.'));
  });

  it('should execute end-to-end child process for --help', async () => {
    const { stdout } = await execFileAsync(process.execPath, [CLI_PATH, '--help']);
    assert.ok(stdout.includes('Google Search Console (GSC) Submission Tool'));
    assert.ok(stdout.includes('Options:'));
    assert.ok(stdout.includes('--site-url'));
  });
});
