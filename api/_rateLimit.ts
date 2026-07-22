const hits = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fallback to in-memory rate limiter if Upstash is not configured
  if (!url || !token) {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
  }

  // Upstash Redis REST API implementation
  try {
    const redisKey = `ratelimit:${key}`;
    const windowSec = Math.ceil(windowMs / 1000);

    // Increment request count
    const incrRes = await fetch(`${url}/incr/${redisKey}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!incrRes.ok) throw new Error("Redis INCR failed");
    const { result: count } = await incrRes.json();

    // If it's the first hit, set expiration
    if (count === 1) {
      await fetch(`${url}/expire/${redisKey}/${windowSec}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    const remaining = Math.max(0, limit - count);
    const allowed = count <= limit;

    return { allowed, remaining };
  } catch (err) {
    console.error("Rate limit Redis error, falling back to memory:", err);
    // Fallback to in-memory on error
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
  }
}

