declare const process: {
  env: Record<string, string | undefined>;
};

import { createHash, randomUUID } from 'node:crypto';

type NodeLikeRequest = AsyncIterable<string | { toString(): string }> & {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
};

type NodeLikeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

type MistralProxyRequest = {
  systemPrompt?: unknown;
  userPrompt?: unknown;
  model?: unknown;
};

type MistralResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type NormalizedError = {
  errorCode: string;
  message: string;
  status: number;
  requestId: string;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const ALLOWED_MODELS = [
  'mistral-large-latest',
  'mistral-medium-latest',
  'codestral-latest',
] as const;
const MAX_PROMPT_CHARS = 120_000;
const DEFAULT_MODEL = 'mistral-large-latest';
const PRODUCTION_ORIGIN = 'https://vibecraft.rubberduck.sk';
const DEFAULT_MAX_BODY_BYTES = 65_536;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX = 20;

const rateBuckets = new Map<string, RateBucket>();

const createRequestId = (): string => `req_${randomUUID().replace(/-/g, '')}`;

const toBoolEnv = (value: string | undefined): boolean => value?.toLowerCase() === 'true';

const readPositiveIntEnv = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

const readJsonBody = async (
  req: NodeLikeRequest,
  maxBytes: number
): Promise<
  | { ok: true; body: MistralProxyRequest }
  | { ok: false; status: number; errorCode: string; message: string }
> => {
  let rawBody = '';
  let bodyBytes = 0;

  for await (const chunk of req) {
    const value = typeof chunk === 'string' ? chunk : chunk.toString();
    bodyBytes += Buffer.byteLength(value);
    if (bodyBytes > maxBytes) {
      return {
        ok: false,
        status: 413,
        errorCode: 'payload_too_large',
        message: `Request body exceeds ${maxBytes} bytes.`,
      };
    }
    rawBody += value;
  }

  if (!rawBody) {
    return { ok: true, body: {} };
  }

  try {
    return {
      ok: true,
      body: JSON.parse(rawBody) as MistralProxyRequest,
    };
  } catch {
    return {
      ok: false,
      status: 400,
      errorCode: 'invalid_json',
      message: 'Invalid JSON body.',
    };
  }
};

const writeJson = (
  res: NodeLikeResponse,
  statusCode: number,
  payload: Record<string, unknown>,
  requestId: string
) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('x-request-id', requestId);
  res.end(JSON.stringify(payload));
};

const writeError = (
  res: NodeLikeResponse,
  status: number,
  errorCode: string,
  message: string,
  requestId: string
) => {
  const payload: NormalizedError = {
    errorCode,
    message,
    status,
    requestId,
  };
  writeJson(res, status, payload, requestId);
};

const getMistralKeys = (): string[] => [
  process.env.MISTRAL_API_KEY_1?.trim(),
  process.env.MISTRAL_API_KEY_2?.trim(),
].filter((key): key is string => Boolean(key));

const getAllowedOrigins = (): Set<string> => {
  const origins = [PRODUCTION_ORIGIN];
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    origins.push(`https://${vercelUrl}`);
  }

  return new Set(origins);
};

const getHeader = (req: NodeLikeRequest, name: string): string => {
  const value = req.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value || '';
};

const getClientIp = (req: NodeLikeRequest): string => {
  const xff = getHeader(req, 'x-forwarded-for');
  if (xff) {
    return xff.split(',')[0]?.trim() || 'unknown';
  }
  return getHeader(req, 'x-real-ip') || getHeader(req, 'cf-connecting-ip') || 'unknown';
};

const getRequestOrigin = (req: NodeLikeRequest): string => {
  const origin = getHeader(req, 'origin');
  if (origin) {
    return origin;
  }

  const referer = getHeader(req, 'referer');
  if (!referer) {
    return '';
  }

  try {
    return new URL(referer).origin;
  } catch {
    return '';
  }
};

const isAllowedOrigin = (origin: string): boolean => {
  return getAllowedOrigins().has(origin);
};

const getServiceToken = (): string => process.env.VIBE_SERVICE_TOKEN?.trim() || '';

const getTokenIdentity = (token: string): string => {
  const digest = createHash('sha256').update(token).digest('hex');
  return `tok_${digest.slice(0, 12)}`;
};

const verifyServiceToken = (
  req: NodeLikeRequest
):
  | { ok: true; tokenIdentity: string }
  | { ok: false; status: number; errorCode: string; message: string } => {
  const authHeader = getHeader(req, 'authorization');
  const [scheme, value] = authHeader.split(' ');
  const bearerToken = scheme?.toLowerCase() === 'bearer' && value ? value.trim() : '';
  const expectedToken = getServiceToken();
  const allowDevBypass = toBoolEnv(process.env.VIBE_ALLOW_DEV_SERVICE_TOKEN);

  if (!expectedToken) {
    if (allowDevBypass && bearerToken) {
      return { ok: true, tokenIdentity: 'dev_bypass' };
    }
    return {
      ok: false,
      status: 401,
      errorCode: 'service_token_missing',
      message: 'Authorization bearer token is required for this request.',
    };
  }

  if (!bearerToken) {
    return {
      ok: false,
      status: 401,
      errorCode: 'service_token_missing',
      message: 'Authorization bearer token is required for this request.',
    };
  }

  if (bearerToken !== expectedToken) {
    return {
      ok: false,
      status: 403,
      errorCode: 'service_token_invalid',
      message: 'Authorization token is invalid.',
    };
  }

  return {
    ok: true,
    tokenIdentity: getTokenIdentity(bearerToken),
  };
};

const isJsonRequest = (req: NodeLikeRequest): boolean => {
  const contentType = getHeader(req, 'content-type');
  return contentType.toLowerCase().split(';')[0].trim() === 'application/json';
};

const isAllowedModel = (model: string): model is typeof ALLOWED_MODELS[number] =>
  ALLOWED_MODELS.includes(model as (typeof ALLOWED_MODELS)[number]);

const checkRateLimit = (params: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): { allowed: boolean } => {
  const now = params.now ?? Date.now();
  const current = rateBuckets.get(params.key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(params.key, {
      count: 1,
      resetAt: now + params.windowMs,
    });
    return { allowed: true };
  }

  current.count += 1;
  rateBuckets.set(params.key, current);
  return { allowed: current.count <= params.limit };
};

const logRequest = (input: {
  route: string;
  method: string;
  requestId: string;
  durationMs: number;
  status: number;
  keySlot: number | null;
  tokenIdentity: string;
  ip: string;
}) => {
  console.info(
    JSON.stringify({
      event: 'api_request',
      route: input.route,
      method: input.method,
      requestId: input.requestId,
      durationMs: input.durationMs,
      status: input.status,
      keySlot: input.keySlot,
      tokenIdentity: input.tokenIdentity,
      ip: input.ip,
    })
  );
};

export default async function handler(req: NodeLikeRequest, res: NodeLikeResponse) {
  const requestId = createRequestId();
  const startedAt = Date.now();
  const ip = getClientIp(req);
  const requestOrigin = getRequestOrigin(req);
  const allowedOrigin = isAllowedOrigin(requestOrigin);
  const maxBodyBytes = readPositiveIntEnv('VIBE_MAX_BODY_BYTES', DEFAULT_MAX_BODY_BYTES);
  const rateLimitWindowMs = readPositiveIntEnv('VIBE_RATE_LIMIT_WINDOW_MS', DEFAULT_RATE_LIMIT_WINDOW_MS);
  const rateLimitMax = readPositiveIntEnv('VIBE_RATE_LIMIT_MAX', DEFAULT_RATE_LIMIT_MAX);
  let status = 200;
  let keySlot: number | null = null;
  let tokenIdentity = 'browser_origin';

  const finishLog = () =>
    logRequest({
      route: '/api/mistral',
      method: req.method || 'UNKNOWN',
      requestId,
      durationMs: Date.now() - startedAt,
      status,
      keySlot,
      tokenIdentity,
      ip,
    });

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Allow', 'POST, OPTIONS');
  res.setHeader('x-request-id', requestId);

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    status = allowedOrigin ? 204 : 403;
    res.statusCode = status;
    res.end();
    finishLog();
    return;
  }

  if (req.method !== 'POST') {
    status = 405;
    writeError(res, 405, 'method_not_allowed', 'Method not allowed.', requestId);
    finishLog();
    return;
  }

  const tokenAuth = verifyServiceToken(req);
  const isServiceTokenPath = tokenAuth.ok;
  if (!allowedOrigin && !isServiceTokenPath) {
    if (requestOrigin) {
      status = 403;
      writeError(res, 403, 'origin_not_allowed', 'Origin is not allowed.', requestId);
      finishLog();
      return;
    }
    status = tokenAuth.status;
    writeError(res, tokenAuth.status, tokenAuth.errorCode, tokenAuth.message, requestId);
    finishLog();
    return;
  }
  if (isServiceTokenPath) {
    tokenIdentity = tokenAuth.tokenIdentity;
  }

  const rateKey = isServiceTokenPath
    ? `mistral:${tokenIdentity}:${ip}`
    : `mistral:${requestOrigin || 'no-origin'}:${ip}`;
  const rate = checkRateLimit({
    key: rateKey,
    limit: rateLimitMax,
    windowMs: rateLimitWindowMs,
  });
  if (!rate.allowed) {
    status = 429;
    writeError(res, 429, 'rate_limit_exceeded', 'Too many requests.', requestId);
    finishLog();
    return;
  }

  if (!isJsonRequest(req)) {
    status = 415;
    writeError(res, 415, 'invalid_content_type', 'Content-Type must be application/json.', requestId);
    finishLog();
    return;
  }

  const keys = getMistralKeys();
  if (keys.length === 0) {
    status = 503;
    writeError(res, 503, 'mistral_keys_missing', 'Mistral server keys are not configured.', requestId);
    finishLog();
    return;
  }

  const parsedBody = await readJsonBody(req, maxBodyBytes);
  if (!parsedBody.ok) {
    status = parsedBody.status;
    writeError(res, parsedBody.status, parsedBody.errorCode, parsedBody.message, requestId);
    finishLog();
    return;
  }

  const body = parsedBody.body;
  const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : '';
  const userPrompt = typeof body.userPrompt === 'string' ? body.userPrompt : '';
  const model = typeof body.model === 'string' && body.model.trim()
    ? body.model.trim()
    : process.env.MISTRAL_MODEL?.trim() || DEFAULT_MODEL;

  if (!systemPrompt.trim() || !userPrompt.trim()) {
    status = 400;
    writeError(res, 400, 'prompt_missing', 'systemPrompt and userPrompt are required.', requestId);
    finishLog();
    return;
  }

  if (!isAllowedModel(model)) {
    status = 400;
    writeError(res, 400, 'model_unsupported', 'Unsupported model.', requestId);
    finishLog();
    return;
  }

  if (systemPrompt.length + userPrompt.length > MAX_PROMPT_CHARS) {
    status = 413;
    writeError(res, 413, 'payload_too_large', 'Prompt payload is too large.', requestId);
    finishLog();
    return;
  }

  let lastStatus = 502;

  for (let index = 0; index < keys.length; index += 1) {
    try {
      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keys[index]}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      lastStatus = mistralResponse.status;
      if (!mistralResponse.ok) {
        continue;
      }

      const data = await mistralResponse.json() as MistralResponse;
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        status = 200;
        keySlot = index + 1;
        writeJson(res, 200, {
          content,
          provider: 'mistral',
          model,
          keySlot: index + 1,
        }, requestId);
        finishLog();
        return;
      }
    } catch {
      lastStatus = 502;
    }
  }

  status = 502;
  writeError(
    res,
    502,
    'mistral_request_failed',
    `Mistral request failed using configured server keys (upstream status: ${lastStatus}).`,
    requestId
  );
  finishLog();
}
