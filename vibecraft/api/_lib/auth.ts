import { createHash } from 'node:crypto';

type NodeLikeRequest = {
  headers?: Record<string, string | string[] | undefined>;
};

const toBoolEnv = (value: string | undefined): boolean => value?.toLowerCase() === 'true';

export const getHeader = (req: NodeLikeRequest, name: string): string => {
  const value = req.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value || '';
};

export const resolveClientIp = (req: NodeLikeRequest): string => {
  const xff = getHeader(req, 'x-forwarded-for');
  if (xff) {
    return xff.split(',')[0]?.trim() || 'unknown';
  }
  return getHeader(req, 'x-real-ip') || getHeader(req, 'cf-connecting-ip') || 'unknown';
};

const tokenIdentity = (token: string): string => {
  const digest = createHash('sha256').update(token).digest('hex');
  return `tok_${digest.slice(0, 12)}`;
};

export const verifyServiceToken = (
  req: NodeLikeRequest
):
  | { ok: true; tokenIdentity: string }
  | { ok: false; status: number; errorCode: string; message: string } => {
  const authHeader = getHeader(req, 'authorization');
  const [scheme, value] = authHeader.split(' ');
  const bearerToken = scheme?.toLowerCase() === 'bearer' && value ? value.trim() : '';

  const expectedToken = process.env.VIBE_SERVICE_TOKEN?.trim() || '';
  const allowDevBypass = toBoolEnv(process.env.VIBE_ALLOW_DEV_SERVICE_TOKEN);

  if (!expectedToken) {
    if (allowDevBypass && bearerToken) {
      return { ok: true, tokenIdentity: 'dev_bypass' };
    }
    return {
      ok: false,
      status: 503,
      errorCode: 'service_token_not_configured',
      message: 'Service token is not configured.',
    };
  }

  if (!bearerToken) {
    return {
      ok: false,
      status: 401,
      errorCode: 'service_token_missing',
      message: 'Authorization bearer token is required.',
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

  return { ok: true, tokenIdentity: tokenIdentity(bearerToken) };
};
