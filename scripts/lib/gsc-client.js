/**
 * Google Search Console Client Implementations:
 * - LiveGscClient: Official Google Search Console API v1 client via googleapis.
 * - MockGscClient: Deterministic, in-memory client for testing and dry-run executions.
 * - createGscClient: Factory returning Live or Mock client based on configuration.
 */

export class LiveGscClient {
  /**
   * @param {Object} config
   * @param {Object} [config.credentials]
   * @param {string} [config.credentialsPath]
   */
  constructor(config) {
    this.config = config;
    this.searchconsole = null;
    this.auth = null;
  }

  async init() {
    if (this.searchconsole) return;

    // Dynamically load googleapis
    const { google } = await import('googleapis');

    const authOptions = {
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    };

    if (this.config.credentials) {
      authOptions.credentials = this.config.credentials;
    } else if (this.config.credentialsPath) {
      authOptions.keyFile = this.config.credentialsPath;
    }

    this.auth = new google.auth.GoogleAuth(authOptions);
    this.searchconsole = google.searchconsole({
      version: 'v1',
      auth: this.auth,
    });
  }

  /**
   * Add a site property to the authenticated Google Search Console account.
   * @param {string} siteUrl
   * @returns {Promise<{ success: boolean, status: number, message: string }>}
   */
  async addSite(siteUrl) {
    await this.init();
    const res = await this.searchconsole.sites.add({ siteUrl });
    return {
      success: true,
      status: res.status || 204,
      message: `Site property "${siteUrl}" registered successfully in Search Console.`,
      data: res.data,
    };
  }

  /**
   * Get site property details and permission level.
   * @param {string} siteUrl
   * @returns {Promise<{ siteUrl: string, permissionLevel?: string } | null>}
   */
  async getSite(siteUrl) {
    await this.init();
    const res = await this.searchconsole.sites.get({ siteUrl });
    return res.data;
  }

  /**
   * Submit a sitemap URL to Search Console.
   * @param {string} siteUrl
   * @param {string} feedpath
   * @returns {Promise<{ success: boolean, status: number, message: string }>}
   */
  async submitSitemap(siteUrl, feedpath) {
    await this.init();
    const res = await this.searchconsole.sitemaps.submit({ siteUrl, feedpath });
    return {
      success: true,
      status: res.status || 204,
      message: `Sitemap "${feedpath}" submitted successfully for property "${siteUrl}".`,
      data: res.data,
    };
  }

  /**
   * Retrieve sitemap status from Search Console.
   * @param {string} siteUrl
   * @param {string} feedpath
   * @returns {Promise<Object>}
   */
  async getSitemap(siteUrl, feedpath) {
    await this.init();
    const res = await this.searchconsole.sitemaps.get({ siteUrl, feedpath });
    return res.data;
  }

  /**
   * List all sitemaps submitted for the property.
   * @param {string} siteUrl
   * @returns {Promise<Array<Object>>}
   */
  async listSitemaps(siteUrl) {
    await this.init();
    const res = await this.searchconsole.sitemaps.list({ siteUrl });
    return res.data.sitemap || [];
  }
}

export class MockGscClient {
  /**
   * @param {Object} [config]
   */
  constructor(config = {}) {
    this.config = config;
    this.calls = [];
    this.sites = new Map();
    this.sitemaps = new Map();
    this.simulatedErrors = new Map();
  }

  /**
   * Configure a simulated error for a specific method.
   * @param {string} method Method name ('addSite', 'submitSitemap', 'getSitemap', 'getSite', 'listSitemaps')
   * @param {Error|Object} error Error instance or error payload { status, message }
   */
  setSimulatedError(method, error) {
    this.simulatedErrors.set(method, error);
  }

  /**
   * Clear any simulated errors.
   */
  clearSimulatedErrors() {
    this.simulatedErrors.clear();
  }

  _checkSimulatedError(method) {
    if (this.simulatedErrors.has(method)) {
      const errPayload = this.simulatedErrors.get(method);
      if (errPayload instanceof Error) {
        throw errPayload;
      }
      const err = new Error(errPayload.message || `Simulated error in ${method}`);
      err.status = errPayload.status || 500;
      err.code = errPayload.code || errPayload.status || 500;
      if (errPayload.response) err.response = errPayload.response;
      throw err;
    }
  }

  async addSite(siteUrl) {
    this.calls.push({ method: 'addSite', args: { siteUrl }, timestamp: Date.now() });
    this._checkSimulatedError('addSite');

    this.sites.set(siteUrl, {
      siteUrl,
      permissionLevel: 'siteOwner',
    });

    return {
      success: true,
      status: 204,
      message: `[DRY-RUN] Site "${siteUrl}" registered successfully in Search Console.`,
      data: {},
    };
  }

  async getSite(siteUrl) {
    this.calls.push({ method: 'getSite', args: { siteUrl }, timestamp: Date.now() });
    this._checkSimulatedError('getSite');

    return this.sites.get(siteUrl) || {
      siteUrl,
      permissionLevel: 'siteOwner',
    };
  }

  async submitSitemap(siteUrl, feedpath) {
    this.calls.push({ method: 'submitSitemap', args: { siteUrl, feedpath }, timestamp: Date.now() });
    this._checkSimulatedError('submitSitemap');

    const key = `${siteUrl}::${feedpath}`;
    const sitemapRecord = {
      path: feedpath,
      lastSubmitted: new Date().toISOString(),
      isPending: true,
      isSitemapsIndex: false,
      type: 'sitemap',
      lastDownloaded: null,
      warnings: 0,
      errors: 0,
      contents: [],
    };
    this.sitemaps.set(key, sitemapRecord);

    return {
      success: true,
      status: 204,
      message: `[DRY-RUN] Sitemap "${feedpath}" submitted successfully for property "${siteUrl}".`,
      data: {},
    };
  }

  async getSitemap(siteUrl, feedpath) {
    this.calls.push({ method: 'getSitemap', args: { siteUrl, feedpath }, timestamp: Date.now() });
    this._checkSimulatedError('getSitemap');

    const key = `${siteUrl}::${feedpath}`;
    return this.sitemaps.get(key) || {
      path: feedpath,
      lastSubmitted: new Date().toISOString(),
      isPending: true,
      isSitemapsIndex: false,
      type: 'sitemap',
      lastDownloaded: null,
      warnings: 0,
      errors: 0,
      contents: [],
    };
  }

  async listSitemaps(siteUrl) {
    this.calls.push({ method: 'listSitemaps', args: { siteUrl }, timestamp: Date.now() });
    this._checkSimulatedError('listSitemaps');

    const result = [];
    for (const [key, val] of this.sitemaps.entries()) {
      if (key.startsWith(`${siteUrl}::`)) {
        result.push(val);
      }
    }
    return result;
  }
}

/**
 * Client factory function.
 * @param {Object} config
 * @returns {Promise<LiveGscClient|MockGscClient>}
 */
export async function createGscClient(config) {
  if (config.dryRun) {
    return new MockGscClient(config);
  }
  const client = new LiveGscClient(config);
  await client.init();
  return client;
}
