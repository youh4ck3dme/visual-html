import { createRequestId } from '../../_lib/request-id.js';
import { getArtifact } from '../../_lib/artifact-store.js';
import { writeNormalizedError, setDefaultApiHeaders } from '../../_lib/errors.js';
import { resolveClientIp } from '../../_lib/auth.js';
import { logApiRequest } from '../../_lib/logging.js';

type NodeLikeRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
};

type NodeLikeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

const readArtifactId = (req: NodeLikeRequest): string => {
  const value = req.query?.artifactId;
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
};

export default async function handler(req: NodeLikeRequest, res: NodeLikeResponse) {
  const requestId = createRequestId();
  const startedAt = Date.now();
  const ip = resolveClientIp(req);
  let status = 200;
  let artifactId: string | null = null;

  try {
    if (req.method !== 'GET') {
      status = 405;
      res.setHeader('Allow', 'GET');
      writeNormalizedError(res, 405, 'method_not_allowed', 'Method not allowed.', requestId);
      return;
    }

    artifactId = readArtifactId(req);
    if (!artifactId) {
      status = 400;
      writeNormalizedError(res, 400, 'artifact_id_missing', 'artifactId is required.', requestId);
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
    setDefaultApiHeaders(res, requestId);
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src https: data:"
    );
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(artifact.html);
  } finally {
    logApiRequest({
      route: '/api/render/[artifactId]/preview',
      method: req.method || 'UNKNOWN',
      requestId,
      durationMs: Date.now() - startedAt,
      status,
      tokenIdentity: 'public_artifact',
      ip,
      artifactId,
    });
  }
}
