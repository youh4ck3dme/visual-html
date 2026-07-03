import { createArtifactId } from './request-id.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type RenderArtifact = {
  artifactId: string;
  createdAt: number;
  expiresAt: number;
  html: string;
};

const DEFAULT_ARTIFACT_TTL_MS = 60 * 60 * 1000;
const DEFAULT_ARTIFACT_MAX_ITEMS = 200;

const artifacts = new Map<string, RenderArtifact>();
const artifactDir = process.env.VIBE_RENDER_TMP_DIR || '/tmp/vibecraft-render-artifacts';

const readPositiveIntEnv = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

const evictExpired = (now: number): void => {
  for (const [key, value] of artifacts.entries()) {
    if (value.expiresAt <= now) {
      artifacts.delete(key);
    }
  }
};

const evictOverflow = (maxItems: number): void => {
  if (artifacts.size <= maxItems) return;
  const ordered = [...artifacts.values()].sort((a, b) => a.createdAt - b.createdAt);
  while (artifacts.size > maxItems && ordered.length > 0) {
    const oldest = ordered.shift();
    if (!oldest) break;
    artifacts.delete(oldest.artifactId);
  }
};

const artifactFilePath = (artifactId: string): string => path.join(artifactDir, `${artifactId}.json`);

const ensureArtifactDir = async (): Promise<void> => {
  await fs.mkdir(artifactDir, { recursive: true });
};

const persistArtifact = async (artifact: RenderArtifact): Promise<void> => {
  await ensureArtifactDir();
  await fs.writeFile(artifactFilePath(artifact.artifactId), JSON.stringify(artifact), 'utf8');
};

const loadPersistedArtifact = async (artifactId: string): Promise<RenderArtifact | null> => {
  try {
    const raw = await fs.readFile(artifactFilePath(artifactId), 'utf8');
    const parsed = JSON.parse(raw) as RenderArtifact;
    if (!parsed?.artifactId || typeof parsed.html !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
};

const deletePersistedArtifact = async (artifactId: string): Promise<void> => {
  try {
    await fs.unlink(artifactFilePath(artifactId));
  } catch {
    // ignore
  }
};

export const createArtifact = async (html: string): Promise<RenderArtifact> => {
  const now = Date.now();
  const ttl = readPositiveIntEnv('VIBE_RENDER_ARTIFACT_TTL_MS', DEFAULT_ARTIFACT_TTL_MS);
  const maxItems = readPositiveIntEnv('VIBE_RENDER_ARTIFACT_MAX_ITEMS', DEFAULT_ARTIFACT_MAX_ITEMS);

  evictExpired(now);
  evictOverflow(maxItems);

  const artifact: RenderArtifact = {
    artifactId: createArtifactId(),
    createdAt: now,
    expiresAt: now + ttl,
    html,
  };
  artifacts.set(artifact.artifactId, artifact);
  await persistArtifact(artifact);
  return artifact;
};

export const getArtifact = async (artifactId: string): Promise<RenderArtifact | null> => {
  const cached = artifacts.get(artifactId);
  const artifact = cached ?? (await loadPersistedArtifact(artifactId));
  if (!artifact) return null;
  if (artifact.expiresAt <= Date.now()) {
    artifacts.delete(artifactId);
    await deletePersistedArtifact(artifactId);
    return null;
  }
  artifacts.set(artifact.artifactId, artifact);
  return artifact;
};
