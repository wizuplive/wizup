import type { SeasonalArtifactSink } from "./artifactSink";
import type { SeasonalSimulationArtifact } from "../types";
import { artifactDocKey, artifactIndexKey } from "./keys";

export type ArtifactIndexEntry = {
  communityId: string;
  seasonId: string;
  outputHash: string;
  inputHash: string;
  configHash: string;
  runnerVersion: string;
  window: { startMs: number; endMs: number };
  writtenAtMs: number;
};

/**
 * 💾 LOCAL STORAGE ARTIFACT SINK
 * ==============================
 * Persistent, client-side storage for ZAPS artifacts.
 * Includes a capped index for efficient audit/replay listing.
 */
export class LocalStorageArtifactSink implements SeasonalArtifactSink {
  constructor(
    private readonly cfg: {
      maxIndexEntries: number; // cap index growth
      storage?: Storage;       // default to window.localStorage
    }
  ) {}

  async write(artifact: SeasonalSimulationArtifact): Promise<void> {
    try {
      const storage = this.cfg.storage ?? window.localStorage;
      if (!storage) return;

      // 1. Write full artifact document
      const docK = artifactDocKey(artifact.communityId, artifact.seasonId);
      storage.setItem(docK, JSON.stringify(artifact));

      // 2. Update index
      const idxK = artifactIndexKey();
      const existingRaw = storage.getItem(idxK);
      const existing: ArtifactIndexEntry[] = existingRaw ? safeJson(existingRaw, []) : [];

      const entry: ArtifactIndexEntry = {
        communityId: artifact.communityId,
        seasonId: artifact.seasonId,
        outputHash: artifact.hashes.outputHash,
        inputHash: artifact.hashes.inputHash,
        configHash: artifact.hashes.configHash,
        runnerVersion: artifact.hashes.runnerVersion,
        window: artifact.window,
        writtenAtMs: Date.now(),
      };

      // Dedupe (keep newest)
      const deduped = [
        entry,
        ...existing.filter((e) => !(e.communityId === entry.communityId && e.seasonId === entry.seasonId)),
      ];

      // Cap size
      const capped = deduped.slice(0, Math.max(1, this.cfg.maxIndexEntries));
      storage.setItem(idxK, JSON.stringify(capped));
    } catch {
      // QuotaExceededError or blocked storage? fail-open.
    }
  }
}

function safeJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}