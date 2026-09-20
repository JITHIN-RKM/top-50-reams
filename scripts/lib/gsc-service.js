/**
 * Core business workflow orchestrator and error diagnostics for Google Search Console API.
 */

/**
 * Extract HTTP status code from Gaxios, standard HTTP, or Node.js error objects.
 * Prioritizes HTTP response status codes over string error codes.
 * @param {any} err
 * @returns {number|string|null}
 */
export function extractHttpStatus(err) {
  if (!err || typeof err !== 'object') return null;

  // 1. Gaxios / Axios response status
  if (typeof err.response?.status === 'number') {
    return err.response.status;
  }

  // 2. Google API error payload status code
  if (typeof err.response?.data?.error?.code === 'number') {
    return err.response.data.error.code;
  }

  // 3. Direct numeric err.status or err.statusCode
  if (typeof err.status === 'number') {
    return err.status;
  }
  if (typeof err.statusCode === 'number') {
    return err.statusCode;
  }

  // 4. String representations of numeric statuses (e.g. "403")
  if (err.status && !isNaN(Number(err.status))) {
    return Number(err.status);
  }
  if (err.statusCode && !isNaN(Number(err.statusCode))) {
    return Number(err.statusCode);
  }

  // 5. Numeric err.code
  if (typeof err.code === 'number') {
    return err.code;
  }
  if (err.code && typeof err.code === 'string' && !isNaN(Number(err.code))) {
    return Number(err.code);
  }

  // 6. Non-numeric system/error codes (e.g. 'ECONNREFUSED', 'ETIMEDOUT', 'ERR_BAD_REQUEST')
  if (err.code && typeof err.code === 'string') {
    return err.code;
  }

  return null;
}

/**
 * Detailed error diagnostics handler for Google Search Console API failures.
 * @param {Error|any} err
 * @param {Object} logger
 * @param {Object} config
 */
export function formatApiError(err, logger, config = {}) {
  const status = extractHttpStatus(err);
  const rawMessage = (err.response?.data?.error?.message) || err.message || 'Unknown Search Console API error';
  const clientEmail = config.clientEmail || config.credentials?.client_email || '<your-service-account-email>';
  const fullText = `${rawMessage} ${err.message || ''}`.toLowerCase();

  if (
    status === 403 ||
    fullText.includes('sufficient permissions') ||
    fullText.includes('not a verified owner') ||
    fullText.includes('permission denied')
  ) {
    logger.error(`[403 FORBIDDEN / PERMISSION DENIED]: The service account does not have permission for this property.`);
    logger.box('ACTION REQUIRED: Delegate Search Console Ownership', [
      '1. Open Google Search Console: https://search.google.com/search-console',
      `2. Select Property: ${config.siteUrl || 'https://sih-ouce.meetthealtezza.tech/'}`,
      '3. Navigate to: Settings > Users and permissions > Add user',
      `4. Enter Service Account Email: ${clientEmail}`,
      '5. Set Permission level: "Owner" (or "Full")',
      '6. Ensure Search Console API is enabled in GCP Console:',
      '   https://console.cloud.google.com/apis/library/searchconsole.googleapis.com',
    ]);
  } else if (status === 401) {
    logger.error(`[401 UNAUTHORIZED]: Authentication failed. The service account credentials or private key are invalid.`);
    logger.info('Please verify that your private_key is intact and valid RSA PEM format.');
  } else if (status === 404) {
    logger.error(`[404 NOT FOUND]: Target resource not found in Search Console.`);
    logger.info(`Ensure the site URL "${config.siteUrl}" matches your registered property format exactly (including trailing slash).`);
  } else if (status === 409) {
    logger.warn(`[409 CONFLICT]: Resource already exists in Google Search Console.`);
  } else if (status === 429) {
    logger.error(`[429 RATE LIMIT]: Search Console API quota exceeded. Please wait a few moments before retrying.`);
  } else {
    logger.error(`API Error (${status || 'Unknown'}): ${rawMessage}`);
  }
}

/**
 * Execute the complete GSC property addition and sitemap submission workflow.
 * @param {Object} options
 * @param {Object} options.config
 * @param {Object} options.client
 * @param {Object} options.logger
 * @returns {Promise<{ siteAdded: boolean, sitemapSubmitted: boolean, sitemapStatus: Object|null, siteUrl: string, sitemapUrl: string }>}
 */
export async function runGscWorkflow({ config, client, logger }) {
  if (!config) throw new Error('config is required for runGscWorkflow');
  if (!client) throw new Error('client is required for runGscWorkflow');
  if (!logger) throw new Error('logger is required for runGscWorkflow');

  logger.info(`Target Property: ${config.siteUrl}`);
  logger.info(`Target Sitemap:  ${config.sitemapUrl}`);
  if (config.dryRun) {
    logger.warn(`[DRY-RUN MODE ACTIVATED]: Simulating API calls without network requests.`);
  }

  const results = {
    siteAdded: false,
    sitemapSubmitted: false,
    sitemapStatus: null,
    siteUrl: config.siteUrl,
    sitemapUrl: config.sitemapUrl,
  };

  // Step 1: Register Site Property
  logger.info(`Step 1/3: Registering site property "${config.siteUrl}"...`);
  try {
    const addRes = await client.addSite(config.siteUrl);
    logger.success(addRes.message || `Site property "${config.siteUrl}" registered successfully.`);
    results.siteAdded = true;
  } catch (err) {
    const status = extractHttpStatus(err);
    const msg = `${err.message || ''} ${err.response?.data?.error?.message || ''}`.toLowerCase();
    if (status === 409 || msg.includes('already exists') || msg.includes('already registered')) {
      logger.warn(`Site property already exists in GSC account. Continuing to sitemap submission...`);
      results.siteAdded = true;
    } else {
      formatApiError(err, logger, config);
      throw err;
    }
  }

  // Step 2: Check Permission Level (Informational)
  try {
    logger.debug(`Checking property permission level...`);
    const siteInfo = await client.getSite(config.siteUrl);
    if (siteInfo && siteInfo.permissionLevel) {
      logger.info(`Current Permission Level: ${siteInfo.permissionLevel}`);
    }
  } catch (err) {
    logger.debug(`Could not inspect site permission level: ${err.message}`);
  }

  // Step 3: Submit Sitemap
  logger.info(`Step 2/3: Submitting sitemap "${config.sitemapUrl}"...`);
  try {
    const submitRes = await client.submitSitemap(config.siteUrl, config.sitemapUrl);
    logger.success(submitRes.message || `Sitemap submitted successfully.`);
    results.sitemapSubmitted = true;
  } catch (err) {
    formatApiError(err, logger, config);
    throw err;
  }

  // Step 4: Verify Sitemap Submission Status
  logger.info(`Step 3/3: Verifying sitemap status...`);
  try {
    const sitemapStatus = await client.getSitemap(config.siteUrl, config.sitemapUrl);
    results.sitemapStatus = sitemapStatus;
    const isPending = sitemapStatus?.isPending ? '(Pending indexing)' : '(Processed)';
    logger.success(`Sitemap verified: ${sitemapStatus?.path || config.sitemapUrl} ${isPending}`);
    if (sitemapStatus?.errors) {
      logger.warn(`Sitemap reported ${sitemapStatus.errors} errors during crawl inspection.`);
    }
  } catch (err) {
    logger.warn(`Sitemap status check pending: ${err.message}. (Submission was successful; status will populate after Googlebot crawls the feed).`);
  }

  return results;
}
