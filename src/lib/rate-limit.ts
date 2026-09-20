import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful fallback if environment variables are missing (e.g. local dev)
const isConfigured = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = isConfigured ? Redis.fromEnv() : ({} as Redis);

// Dummy rate limiter that always allows requests
const dummyLimiter = {
  limit: async (identifier: string) => ({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 10000,
  }),
};

// 1. Global Limiter: 30 requests per 10 seconds
export const globalLimiter = isConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: false,
    })
  : dummyLimiter;

// 2. Team Action Limiter: 10 requests per minute
export const teamActionLimiter = isConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.tokenBucket(10, "1 m", 10),
      analytics: false,
    })
  : dummyLimiter;

// 3. Spam Limiter: 5 requests per minute
export const spamLimiter = isConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.tokenBucket(5, "1 m", 5),
      analytics: false,
    })
  : dummyLimiter;
