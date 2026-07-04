export const RETRY_BACKOFF_MS = {
  firstRetryBase: 900,
  jitter: 400,
} as const;

export function computeRetryDelayMs(random: () => number = Math.random): number {
  return RETRY_BACKOFF_MS.firstRetryBase + Math.floor(random() * (RETRY_BACKOFF_MS.jitter + 1));
}
