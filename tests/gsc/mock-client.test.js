import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MockGscClient, createGscClient } from '../../scripts/lib/gsc-client.js';

describe('MockGscClient & Factory', () => {
  const siteUrl = 'https://sih-ouce.meetthealtezza.tech/';
  const sitemapUrl = 'https://sih-ouce.meetthealtezza.tech/sitemap.xml';

  it('should register site property and record call', async () => {
    const client = new MockGscClient({ dryRun: true });
    const res = await client.addSite(siteUrl);

    assert.equal(res.success, true);
    assert.equal(res.status, 204);
    assert.ok(res.message.includes('[DRY-RUN]'));
    assert.equal(client.calls.length, 1);
    assert.equal(client.calls[0].method, 'addSite');
    assert.equal(client.calls[0].args.siteUrl, siteUrl);

    const siteInfo = await client.getSite(siteUrl);
    assert.equal(siteInfo.siteUrl, siteUrl);
    assert.equal(siteInfo.permissionLevel, 'siteOwner');
  });

  it('should submit sitemap and track submission status', async () => {
    const client = new MockGscClient({ dryRun: true });
    const res = await client.submitSitemap(siteUrl, sitemapUrl);

    assert.equal(res.success, true);
    assert.equal(res.status, 204);
    assert.ok(res.message.includes('[DRY-RUN]'));

    const sitemapStatus = await client.getSitemap(siteUrl, sitemapUrl);
    assert.equal(sitemapStatus.path, sitemapUrl);
    assert.equal(sitemapStatus.isPending, true);
    assert.equal(sitemapStatus.errors, 0);

    const sitemapsList = await client.listSitemaps(siteUrl);
    assert.equal(sitemapsList.length, 1);
    assert.equal(sitemapsList[0].path, sitemapUrl);
  });

  it('should trigger simulated errors when configured', async () => {
    const client = new MockGscClient({ dryRun: true });
    client.setSimulatedError('addSite', { status: 403, message: 'User is not a verified owner' });

    await assert.rejects(
      async () => {
        await client.addSite(siteUrl);
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.ok(err.message.includes('not a verified owner'));
        return true;
      }
    );

    client.clearSimulatedErrors();
    const successRes = await client.addSite(siteUrl);
    assert.equal(successRes.success, true);
  });

  it('should create MockGscClient when dryRun is true in factory', async () => {
    const client = await createGscClient({ dryRun: true });
    assert.ok(client instanceof MockGscClient);
  });
});
