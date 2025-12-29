
import type { ReadinessDecisionArtifact } from "../types";
import { LS_READINESS_KEYS } from "../keys";

const MAX = 50;

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export class LocalStorageReadinessSink {
  constructor(private readonly storage: Storage = window.localStorage) {}

  write(artifact: ReadinessDecisionArtifact): void {
    try {
      const docK = LS_READINESS_KEYS.doc(artifact.seasonId);
      this.storage.setItem(docK, JSON.stringify(artifact));

      const idxK = LS_READINESS_KEYS.index();
      const existing = safeParse<string[]>(this.storage.getItem(idxK), []);
      const next = [artifact.seasonId, ...existing.filter((s) => s !== artifact.seasonId)].slice(0, MAX);
      this.storage.setItem(idxK, JSON.stringify(next));
    } catch {
      // fail-open
    }
  }

  read(seasonId: string): ReadinessDecisionArtifact | null {
    try {
      const raw = this.storage.getItem(LS_READINESS_KEYS.doc(seasonId));
      return raw ? (JSON.parse(raw) as ReadinessDecisionArtifact) : null;
    } catch {
      return null;
    }
  }

  list(): string[] {
    try {
      return safeParse<string[]>(this.storage.getItem(LS_READINESS_KEYS.index()), []);
    } catch {
      return [];
    }
  }
}
