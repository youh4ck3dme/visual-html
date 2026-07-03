import { createRequestId } from './_lib/request-id.js';
import { verifyServiceToken, resolveClientIp } from './_lib/auth.js';
import { checkRateLimit, readPositiveIntEnv } from './_lib/rate-limit.js';
import { writeJson, writeNormalizedError } from './_lib/errors.js';
import { validateRenderRequest } from './_lib/render-schema.js';
import { renderWeb24hHtml } from './_lib/render-html.js';
import { createArtifact } from './_lib/artifact-store.js';
import { getArtifact } from './_lib/artifact-store.js';
import { logApiRequest } from './_lib/logging.js';

type NodeLikeRequest = AsyncIterable<string | { toString(): string }> & {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

type NodeLikeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

const DEFAULT_MAX_BODY_BYTES = 65_536;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX = 20;

const readJsonWithSizeLimit = async (
  req: NodeLikeRequest,
  maxBytes: number
): Promise<
  | { ok: true; value: unknown; bodyBytes: number }
  | { ok: false; status: number; errorCode: string; message: string }
> => {
  if (req.body !== undefined) {
    const raw = JSON.stringify(req.body);
    const bodyBytes = Buffer.byteLength(raw);
    if (bodyBytes > maxBytes) {
      return {
        ok: false,
        status: 413,
        errorCode: 'payload_too_large',
        message: `Request body exceeds ${maxBytes} bytes.`,
      };
    }
    return { ok: true, value: req.body, bodyBytes };
  }

  let raw = '';
  let bodyBytes = 0;

  for await (const chunk of req) {
    const part = typeof chunk === 'string' ? chunk : chunk.toString();
    bodyBytes += Buffer.byteLength(part);
    if (bodyBytes > maxBytes) {
      return {
        ok: false,
        status: 413,
        errorCode: 'payload_too_large',
        message: `Request body exceeds ${maxBytes} bytes.`,
      };
    }
    raw += part;
  }

  try {
    return {
      ok: true,
      value: raw ? JSON.parse(raw) : {},
      bodyBytes,
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

export default async function handler(req: NodeLikeRequest, res: NodeLikeResponse) {
  const requestId = createRequestId();
  const startedAt = Date.now();
  const ip = resolveClientIp(req);
  let status: number | undefined;
  let tokenIdentity = 'unknown';
  let artifactId: string | null = null;
  let payloadKeys: string[] = [];

  try {
    if (req.method === 'GET') {
      const modeRaw = req.query?.mode;
      const artifactRaw = req.query?.artifactId;
      const mode = Array.isArray(modeRaw) ? modeRaw[0] : modeRaw;
      const artifactKey = Array.isArray(artifactRaw) ? artifactRaw[0] : artifactRaw;
      artifactId = artifactKey || null;

      if (!artifactId || (mode !== 'preview' && mode !== 'export')) {
        status = 400;
        writeNormalizedError(res, 400, 'invalid_request', 'artifactId and mode are required.', requestId);
        return;
      }

      const artifact = await getArtifact(artifactId);
      if (!artifact) {
        status = 404;
        writeNormalizedError(res, 404, 'artifact_not_found', 'Artifact not found.', requestId);
        return;
      }

      status = 200;
      res.statusCode = 200;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('x-request-id', requestId);
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src https: data:"
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (mode === 'export') {
        res.setHeader('Content-Disposition', `attachment; filename="web24h-${artifact.artifactId}.html"`);
      }
      res.end(artifact.html);
      return;
    }

    if (req.method !== 'POST') {
      status = 405;
      res.setHeader('Allow', 'POST, GET');
      writeNormalizedError(res, 405, 'method_not_allowed', 'Method not allowed.', requestId);
      return;
    }

    const auth = verifyServiceToken(req);
    if (!auth.ok) {
      status = auth.status;
      writeNormalizedError(res, auth.status, auth.errorCode, auth.message, requestId);
      return;
    }
    tokenIdentity = auth.tokenIdentity;

    const windowMs = readPositiveIntEnv('VIBE_RATE_LIMIT_WINDOW_MS', DEFAULT_RATE_LIMIT_WINDOW_MS);
    const limit = readPositiveIntEnv('VIBE_RATE_LIMIT_MAX', DEFAULT_RATE_LIMIT_MAX);
    const maxBodyBytes = readPositiveIntEnv('VIBE_MAX_BODY_BYTES', DEFAULT_MAX_BODY_BYTES);

    const rate = checkRateLimit({
      key: `render:${tokenIdentity}:${ip}`,
      windowMs,
      limit,
    });
    if (!rate.allowed) {
      status = 429;
      writeNormalizedError(res, 429, 'rate_limit_exceeded', 'Too many requests.', requestId);
      return;
    }

    const parsed = await readJsonWithSizeLimit(req, maxBodyBytes);
    if (!parsed.ok) {
      status = parsed.status;
      writeNormalizedError(res, parsed.status, parsed.errorCode, parsed.message, requestId);
      return;
    }
    payloadKeys = parsed.value && typeof parsed.value === 'object' && !Array.isArray(parsed.value)
      ? Object.keys(parsed.value as Record<string, unknown>)
      : [];

    const validated = validateRenderRequest(parsed.value);
    if (!validated.ok) {
      console.warn(
        JSON.stringify({
          event: 'render_validation_failed',
          requestId,
          payloadKeys,
          message: validated.message,
        })
      );
      status = 400;
      writeNormalizedError(res, 400, 'render_payload_invalid', validated.message, requestId);
      return;
    }

    const html = renderWeb24hHtml(validated.value);
    const artifact = await createArtifact(html);
    artifactId = artifact.artifactId;

    status = 200;
    writeJson(
      res,
      200,
      {
        artifactId: artifact.artifactId,
        status: 'ready',
        previewUrl: `/api/render/${artifact.artifactId}/preview`,
        exportUrl: `/api/render/${artifact.artifactId}/export`,
      },
      requestId
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'render_handler_error',
        requestId,
        payloadKeys,
        errorName: error instanceof Error ? error.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    );
    status = 500;
    writeNormalizedError(res, 500, 'render_failed', 'Render failed.', requestId);
  } finally {
    logApiRequest({
      route: '/api/render',
      method: req.method || 'UNKNOWN',
      requestId,
      durationMs: Date.now() - startedAt,
      status: status ?? 500,
      tokenIdentity,
      ip,
      artifactId,
    });
  }
}
