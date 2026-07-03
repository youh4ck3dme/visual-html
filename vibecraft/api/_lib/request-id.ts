import { randomUUID } from 'node:crypto';

export const createRequestId = (): string => `req_${randomUUID().replace(/-/g, '')}`;

export const createArtifactId = (): string => `art_${randomUUID().replace(/-/g, '')}`;
