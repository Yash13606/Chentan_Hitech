/**
 * Rate limiting via Upstash Redis + @upstash/ratelimit.
 * Gracefully degrades (allows request) if env vars are not configured.
 *
 * Set these in .env when Upstash is provisioned:
 *   UPSTASH_REDIS_REST_URL=...
 *   UPSTASH_REDIS_REST_TOKEN=...
 */

type RateLimitResult = { success: boolean; limit: number; remaining: number };

let _limiter: {
  auth: (ip: string) => Promise<RateLimitResult>;
  rfq: (userId: string) => Promise<RateLimitResult>;
} | null = null;

async function getLimiter() {
  if (_limiter) return _limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Return a no-op limiter — always allows
    _limiter = {
      auth: async () => ({ success: true, limit: Infinity, remaining: Infinity }),
      rfq: async () => ({ success: true, limit: Infinity, remaining: Infinity }),
    };
    return _limiter;
  }

  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");

  const redis = new Redis({ url, token });

  const authLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 auth attempts per minute per IP
    analytics: false,
    prefix: "cht:rl:auth",
  });

  const rfqLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 RFQs per hour per user
    analytics: false,
    prefix: "cht:rl:rfq",
  });

  _limiter = {
    auth: (ip: string) => authLimit.limit(ip),
    rfq: (userId: string) => rfqLimit.limit(userId),
  };

  return _limiter;
}

export async function checkAuthRateLimit(ip: string): Promise<boolean> {
  const limiter = await getLimiter();
  const result = await limiter.auth(ip);
  return result.success;
}

export async function checkRfqRateLimit(userId: string): Promise<boolean> {
  const limiter = await getLimiter();
  const result = await limiter.rfq(userId);
  return result.success;
}
