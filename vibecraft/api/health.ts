import { randomUUID } from 'node:crypto';

type NodeLikeRequest = {
  method?: string;
};

type NodeLikeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

const createRequestId = (): string => `req_${randomUUID().replace(/-/g, '')}`;

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
  res.setHeader('x-request-id', requestId);
  res.end(JSON.stringify(payload));
};

export default async function handler(req: NodeLikeRequest, res: NodeLikeResponse) {
  const requestId = createRequestId();

  if (req.method !== 'GET') {
    writeJson(
      res,
      405,
      {
        errorCode: 'method_not_allowed',
        message: 'Method not allowed.',
        status: 405,
        requestId,
      },
      requestId
    );
    return;
  }

  writeJson(
    res,
    200,
    {
      ok: true,
      service: 'vibecraft',
      timestamp: new Date().toISOString(),
    },
    requestId
  );
}
