export const logApiRequest = (input: {
  route: string;
  method: string;
  requestId: string;
  durationMs: number;
  status: number;
  tokenIdentity: string;
  ip: string;
  artifactId?: string | null;
}): void => {
  console.info(
    JSON.stringify({
      event: 'api_request',
      route: input.route,
      method: input.method,
      requestId: input.requestId,
      durationMs: input.durationMs,
      status: input.status,
      tokenIdentity: input.tokenIdentity,
      ip: input.ip,
      artifactId: input.artifactId ?? null,
    })
  );
};
