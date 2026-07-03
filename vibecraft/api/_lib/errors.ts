type NodeLikeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

export type NormalizedError = {
  errorCode: string;
  message: string;
  status: number;
  requestId: string;
};

export const setDefaultApiHeaders = (res: NodeLikeResponse, requestId: string): void => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('x-request-id', requestId);
};

export const writeJson = (
  res: NodeLikeResponse,
  statusCode: number,
  payload: Record<string, unknown>,
  requestId: string
): void => {
  res.statusCode = statusCode;
  setDefaultApiHeaders(res, requestId);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

export const writeNormalizedError = (
  res: NodeLikeResponse,
  status: number,
  errorCode: string,
  message: string,
  requestId: string
): void => {
  const payload: NormalizedError = {
    errorCode,
    message,
    status,
    requestId,
  };
  writeJson(res, status, payload, requestId);
};
