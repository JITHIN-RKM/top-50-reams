import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runGscWorkflow, formatApiError } from '../../scripts/lib/gsc-service.js';
import { MockGscClient } from '../../scripts/lib/gsc-client.js';
import { GscLogger } from '../../scripts/lib/gsc-logger.js';

describe('GSC Service Workflow & Error Diagnostics', () => {
  const config = {
    siteUrl: 'https://sih-ouce.meetthealtezza.tech/',
    sitemapUrl: 'https://sih-ouce.meetthealtezza.tech/sitemap.xml',
    clientEmail: 'test-gsc@my-project.iam.gserviceaccount.com',
    dryRun: true,
    verbose: false,
  };

  function createSilentLogger() {
    const logs = [];
    const logger = new GscLogger({
      outputFn: (msg) => logs.push({ type: 'out', msg }),
      errorFn: (msg) => logs.push({ type: 'err', msg }),
      colors: false,
    });
    return { logger, logs };
  }

  it('should complete the entire workflow successfully in happy path', async () => {
    const client = new MockGscClient(config);
    const { logger } = createSilentLogger();

    const result = await runGscWorkflow({ config, client, logger });

    assert.equal(result.siteAdded, true);
    assert.equal(result.sitemapSubmitted, true);
    assert.ok(result.sitemapStatus);
    assert.equal(result.sitemapStatus.path, config.sitemapUrl);
    assert.equal(client.calls.length, 4); // addSite, getSite, submitSitemap, getSitemap
  });

  it('should handle 409 Conflict gracefully when site already exists', async () => {
    const client = new MockGscClient(config);
    client.setSimulatedError('addSite', { status: 409, message: 'Resource already exists' });
    const { logger } = createSilentLogger();

    const result = await runGscWorkflow({ config, client, logger });

    assert.equal(result.siteAdded, true);
    assert.equal(result.sitemapSubmitted, true);
  });

  it('should handle 403 Forbidden with actionable Owner delegation guidance', async () => {
    const client = new MockGscClient(config);
    client.setSimulatedError('addSite', {
      status: 403,
      message: 'User does not have sufficient permissions for site',
    });
    const { logger, logs } = createSilentLogger();

    await assert.rejects(
      async () => {
        await runGscWorkflow({ config, client, logger });
      },
      (err) => {
        assert.equal(err.status, 403);
        return true;
      }
    );

    const errorLogs = logs.map((l) => l.msg).join('\n');
    assert.ok(errorLogs.includes('403 FORBIDDEN'));
    assert.ok(errorLogs.includes(config.clientEmail));
    assert.ok(errorLogs.includes('Settings > Users and permissions > Add user'));
  });

  it('should handle 401 Unauthorized with credential error logs', async () => {
    const client = new MockGscClient(config);
    client.setSimulatedError('submitSitemap', {
      status: 401,
      message: 'Invalid Credentials',
    });
    const { logger, logs } = createSilentLogger();

    await assert.rejects(
      async () => {
        await runGscWorkflow({ config, client, logger });
      },
      (err) => {
        assert.equal(err.status, 401);
        return true;
      }
    );

    const errorLogs = logs.map((l) => l.msg).join('\n');
    assert.ok(errorLogs.includes('401 UNAUTHORIZED'));
  });

  it('should handle 404 Not Found with site URL guidance', async () => {
    const client = new MockGscClient(config);
    client.setSimulatedError('submitSitemap', {
      status: 404,
      message: 'Requested entity was not found',
    });
    const { logger, logs } = createSilentLogger();

    await assert.rejects(
      async () => {
        await runGscWorkflow({ config, client, logger });
      },
      (err) => {
        assert.equal(err.status, 404);
        return true;
      }
    );

    const errorLogs = logs.map((l) => l.msg).join('\n');
    assert.ok(errorLogs.includes('404 NOT FOUND'));
  });

  it('should handle 429 Rate Limit error', async () => {
    const client = new MockGscClient(config);
    client.setSimulatedError('addSite', {
      status: 429,
      message: 'Quota exceeded',
    });
    const { logger, logs } = createSilentLogger();

    await assert.rejects(
      async () => {
        await runGscWorkflow({ config, client, logger });
      },
      (err) => {
        assert.equal(err.status, 429);
        return true;
      }
    );

    const errorLogs = logs.map((l) => l.msg).join('\n');
    assert.ok(errorLogs.includes('429 RATE LIMIT'));
  });

  it('should succeed even if getSitemap throws after sitemap is submitted', async () => {
    const client = new MockGscClient(config);
    client.setSimulatedError('getSitemap', {
      status: 404,
      message: 'Sitemap not yet processed by crawler',
    });
    const { logger } = createSilentLogger();

    const result = await runGscWorkflow({ config, client, logger });

    assert.equal(result.siteAdded, true);
    assert.equal(result.sitemapSubmitted, true);
    assert.equal(result.sitemapStatus, null);
  });
});
