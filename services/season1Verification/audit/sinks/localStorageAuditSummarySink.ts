import { SeasonAuditSummaryArtifact } from "../types";
import { LS_AUDIT_KEYS } from "../keys";

const MAX_INDEX_ENTRIES = 50;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export class LocalStorageAuditSummarySink {
  constructor(private readonly storage: Storage = window.localStorage) {}

  write(summary: SeasonAuditSummaryArtifact): void {
    try {
      const docKey = LS_AUDIT_KEYS.summaryDoc(summary.seasonId);
      this.storage.setItem(docKey, JSON.stringify(summary));

      const indexKey = LS_AUDIT_KEYS.summaryIndex();
      const existing = safeParse<string[]>(this.storage.getItem(indexKey), []);

      // Keep index unique and capped
      const next = [
        summary.seasonId,
        ...existing.filter((s) => s !== summary.seasonId)
      ].slice(0, MAX_INDEX_ENTRIES);

      this.storage.setItem(indexKey, JSON.stringify(next));
    } catch {
      // fail-open
    }
  }

  listSeasons(): string[] {
    return safeParse<string[]>(this.storage.getItem(LS_AUDIT_KEYS.summaryIndex()), []);
  }

  read(seasonId: string): SeasonAuditSummaryArtifact | null {
    const raw = this.storage.getItem(LS_AUDIT_KEYS.summaryDoc(seasonId));
    return raw ? (JSON.parse(raw) as SeasonAuditSummaryArtifact) : null;
  }
}