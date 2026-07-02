export type MistralKeyRole = "ocr" | "chat";

function parseCsvKeys(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function dedupeKeys(keys: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const key of keys) {
    if (!key?.trim()) continue;
    const trimmed = key.trim();
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function globalKeyPool(): string[] {
  return dedupeKeys([
    ...parseCsvKeys(process.env.MISTRAL_API_KEY),
    ...parseCsvKeys(process.env.MISTRAL_API_KEY_FALLBACK),
    ...parseCsvKeys(process.env.MISTRAL_API_KEYS),
  ]);
}

function roleDedicatedKey(role: MistralKeyRole): string | undefined {
  if (role === "ocr") return process.env.MISTRAL_OCR_API_KEY;
  return (
    process.env.MISTRAL_CHAT_API_KEY ??
    process.env.MISTRAL_SYNTHESIS_API_KEY ??
    process.env.MISTRAL_GENERATE_API_KEY
  );
}

function roleExtraKeys(role: MistralKeyRole): string[] {
  if (role === "ocr") return parseCsvKeys(process.env.MISTRAL_OCR_API_KEYS);
  return parseCsvKeys(
    process.env.MISTRAL_CHAT_API_KEYS ??
      process.env.MISTRAL_SYNTHESIS_API_KEYS ??
      process.env.MISTRAL_GENERATE_API_KEYS,
  );
}

/**
 * Ordered Mistral key pool for a pipeline role.
 *
 * Parallel split (optional):
 *   MISTRAL_OCR_API_KEY=keyA
 *   MISTRAL_CHAT_API_KEY=keyB
 *
 * Quota failover (fallback chain):
 *   MISTRAL_API_KEY=primary
 *   MISTRAL_API_KEY_FALLBACK=secondary
 *   MISTRAL_API_KEYS=key1,key2,key3
 */
export function getMistralKeyPool(role: MistralKeyRole): string[] {
  const dedicated = roleDedicatedKey(role);
  const pool = dedicated
    ? dedupeKeys([dedicated, ...roleExtraKeys(role), ...globalKeyPool()])
    : globalKeyPool();
  return pool;
}

const QUOTA_HINT =
  /quota|rate.?limit|billing|exceeded|insufficient|credit|capacity|too many requests/i;

export function shouldFailoverToNextKey(
  status: number,
  bodyText: string,
  hasMoreKeys: boolean,
): boolean {
  if (!hasMoreKeys) return false;
  if (status === 429 || status === 402 || status === 503) return true;

  if ((status === 400 || status === 401 || status === 403) && QUOTA_HINT.test(bodyText)) {
    return true;
  }

  return false;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}
