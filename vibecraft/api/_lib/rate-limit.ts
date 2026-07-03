type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const readPositiveIntEnv = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

export const checkRateLimit = (params: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): { allowed: boolean; resetAt: number } => {
  const now = params.now ?? Date.now();
  const current = buckets.get(params.key);

  if (!current || current.resetAt <= now) {
    const next: Bucket = {
      count: 1,
      resetAt: now + params.windowMs,
    };
    buckets.set(params.key, next);
    return { allowed: true, resetAt: next.resetAt };
  }

  current.count += 1;
  buckets.set(params.key, current);
  return { allowed: current.count <= params.limit, resetAt: current.resetAt };
};
