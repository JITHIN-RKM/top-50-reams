import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
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
} from "../../scripts/lib/gsc-config.js";
import { MockGscClient, createGscClient, LiveGscClient } from "../../scripts/lib/gsc-client.js";
import { runGscWorkflow, formatApiError } from "../../scripts/lib/gsc-service.js";
import { GscLogger } from "../../scripts/lib/gsc-logger.js";

describe("Empirical Challenge Suite", () => {
  let tmpDir;

  function createTestLogger() {
    const logs = [];
    const logger = new GscLogger({
      outputFn: (m) => logs.push({ type: "out", text: m }),
      errorFn: (m) => logs.push({ type: "err", text: m }),
      quiet: false,
      colors: false,
    });
    return { logger, logs };
  }

  describe("1. Idempotency Stress Tests", () => {
    const config = {
      siteUrl: "https://sih-ouce.meetthealtezza.tech/",
      sitemapUrl: "https://sih-ouce.meetthealtezza.tech/sitemap.xml",
      clientEmail: "test-idempotency@project.iam.gserviceaccount.com",
      dryRun: true,
      verbose: false,
    };

    it("should succeed across 5 consecutive workflow executions", async () => {
      const client = new MockGscClient(config);
      const { logger } = createTestLogger();

      for (let i = 1; i <= 5; i++) {
        const res = await runGscWorkflow({ config, client, logger });
        assert.equal(res.siteAdded, true, `Run ${i} siteAdded should be true`);
        assert.equal(res.sitemapSubmitted, true, `Run ${i} sitemapSubmitted should be true`);
        assert.ok(res.sitemapStatus, `Run ${i} sitemapStatus should exist`);
      }
      assert.equal(client.calls.length, 20); // 4 calls per run * 5
    });

    it("should handle 409 status on site addition gracefully", async () => {
      const client = new MockGscClient(config);
      client.setSimulatedError("addSite", { status: 409, message: "Site already registered" });
      const { logger } = createTestLogger();

      const res = await runGscWorkflow({ config, client, logger });
      assert.equal(res.siteAdded, true);
      assert.equal(res.sitemapSubmitted, true);
    });

    it("should handle error messages containing 'already exists' or 'already registered'", async () => {
      const client = new MockGscClient(config);
      client.setSimulatedError("addSite", new Error("The property is already registered in account"));
      const { logger } = createTestLogger();

      const res = await runGscWorkflow({ config, client, logger });
      assert.equal(res.siteAdded, true);
      assert.equal(res.sitemapSubmitted, true);
    });
  });

  describe("2. Precedence Stress Tests", () => {
    it("should prioritize CLI args over env vars and config files", async () => {
      const tmpFile = path.join(os.tmpdir(), `gsc-cli-test-${Date.now()}.json`);
      fs.writeFileSync(
        tmpFile,
        JSON.stringify({
          client_email: "cli-file@example.com",
          private_key: "-----BEGIN PRIVATE KEY-----\nkey1\n-----END PRIVATE KEY-----",
        })
      );

      const resolved = resolveCredentials({
        explicitPath: tmpFile,
        env: {
          GSC_CREDENTIALS_JSON: JSON.stringify({
            client_email: "inline@example.com",
            private_key: "-----BEGIN PRIVATE KEY-----\nkey2\n-----END PRIVATE KEY-----",
          }),
          GSC_CLIENT_EMAIL: "single@example.com",
          GSC_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nkey3\n-----END PRIVATE KEY-----",
        },
      });

      try { fs.unlinkSync(tmpFile); } catch {}
      assert.equal(resolved.clientEmail, "cli-file@example.com");
    });

    it("should prioritize inline JSON over individual env vars and paths", () => {
      const resolved = resolveCredentials({
        env: {
          GSC_CREDENTIALS_JSON: JSON.stringify({
            client_email: "inline@example.com",
            private_key: "-----BEGIN PRIVATE KEY-----\nkey_inline\n-----END PRIVATE KEY-----",
          }),
          GSC_CLIENT_EMAIL: "single@example.com",
          GSC_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nkey_single\n-----END PRIVATE KEY-----",
        },
      });
      assert.equal(resolved.clientEmail, "inline@example.com");
    });

    it("should prioritize individual env vars over environment file path", () => {
      const resolved = resolveCredentials({
        env: {
          GSC_CLIENT_EMAIL: "single@example.com",
          GSC_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nkey_single\n-----END PRIVATE KEY-----",
          GSC_CREDENTIALS_PATH: "./non-existent-path.json",
        },
      });
      assert.equal(resolved.clientEmail, "single@example.com");
    });

    it("should prioritize CLI site-url and sitemap-url over env vars", async () => {
      const config = await loadConfig(
        ["--site-url", "https://custom-cli.com/", "--sitemap-url", "https://custom-cli.com/sitemap.xml", "--dry-run"],
        {
          GSC_SITE_URL: "https://env-site.com/",
          GSC_SITEMAP_URL: "https://env-site.com/sitemap.xml",
        }
      );
      assert.equal(config.siteUrl, "https://custom-cli.com/");
      assert.equal(config.sitemapUrl, "https://custom-cli.com/sitemap.xml");
    });
  });

  describe("3. Private Key Unescaping & Normalization", () => {
    it("should convert literal escaped \\n into newline characters", () => {
      const input = "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6\\n-----END PRIVATE KEY-----";
      const res = normalizePrivateKey(input);
      assert.ok(res.includes("\n"));
      assert.ok(!res.includes("\\n"));
      assert.equal(res.split("\n").length, 3);
    });

    it("should leave actual multiline keys intact", () => {
      const input = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6\n-----END PRIVATE KEY-----\n";
      const res = normalizePrivateKey(input);
      assert.equal(res, input);
    });

    it("should handle CRLF Windows line endings", () => {
      const input = "-----BEGIN PRIVATE KEY-----\r\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6\r\n-----END PRIVATE KEY-----\r\n";
      const res = normalizePrivateKey(input);
      assert.ok(res.includes("BEGIN PRIVATE KEY"));
    });

    it("should return empty string for null, undefined, or empty key", () => {
      assert.equal(normalizePrivateKey(null), "");
      assert.equal(normalizePrivateKey(undefined), "");
      assert.equal(normalizePrivateKey(""), "");
    });
  });

  describe("4. Gaxios / Google API Error Handling & Diagnostics", () => {
    it("should handle Gaxios error with ERR_BAD_REQUEST and response.status = 403", () => {
      const { logger, logs } = createTestLogger();
      const gaxiosError = new Error("Request failed with status code 403");
      gaxiosError.code = "ERR_BAD_REQUEST";
      gaxiosError.response = { status: 403, data: { error: { message: "Permission Denied" } } };

      formatApiError(gaxiosError, logger, { clientEmail: "sa@iam.gserviceaccount.com" });
      const combined = logs.map((l) => l.text).join("\n");
      const matched403 = combined.includes("[403 FORBIDDEN") && combined.includes("sa@iam.gserviceaccount.com");
      // Note: If status evaluation prioritizes err.code (string) over err.response.status, this will expose the shadow bug
      assert.equal(matched403, true, "Gaxios 403 error must trigger actionable Owner delegation instructions");
    });

    it("should handle Gaxios 409 conflict during site registration", async () => {
      const config = {
        siteUrl: "https://sih-ouce.meetthealtezza.tech/",
        sitemapUrl: "https://sih-ouce.meetthealtezza.tech/sitemap.xml",
        clientEmail: "test-gsc@iam.gserviceaccount.com",
        dryRun: true,
      };
      const { logger } = createTestLogger();
      const client = new MockGscClient(config);

      const gaxios409 = new Error("Request failed with status code 409");
      gaxios409.code = "ERR_BAD_REQUEST";
      gaxios409.response = { status: 409, statusText: "Conflict", data: { error: { code: 409, message: "Site exists" } } };

      client.setSimulatedError("addSite", gaxios409);

      const result = await runGscWorkflow({ config, client, logger });
      assert.equal(result.siteAdded, true, "Workflow must treat Gaxios 409 as site already registered");
    });
  });
});
