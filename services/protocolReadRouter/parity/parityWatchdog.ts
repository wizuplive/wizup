import type { ProtocolArtifactKey, ReadResult } from "../types";
import type { ParityReportArtifact, ParityReportEntry } from "./parityTypes";
import { ParityReportStore } from "./parityStore";

/**
 * 🐕 PARITY WATCHDOG
 * =================
 */

function makeId(): string {
  return `parity_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export class ParityWatchdog {
  private store = new ParityReportStore();

  constructor(private readonly deps: { enabled: () => boolean }) {}

  observe<T>(key: ProtocolArtifactKey, ls: ReadResult<T>, fs: ReadResult<T>): void {
    try {
      if (!this.deps.enabled()) return;

      const now = Date.now();
      const entry: ParityReportEntry = {
        kind: key.kind,
        seasonId: key.seasonId,
        communityId: key.communityId,
        status: this.classify(ls, fs),
        lsFingerprint: ls.fingerprint,
        fsFingerprint: fs.fingerprint,
        observedAtMs: now,
      };

      const report: ParityReportArtifact = {
        id: makeId(),
        schemaVersion: "v1",
        observedAtMs: now,
        entries: [entry],
      };

      this.store.write(report);
    } catch {
      // fail-open
    }
  }

  private classify(ls: ReadResult<any>, fs: ReadResult<any>) {
    const hasLs = !!ls.value;
    const hasFs = !!fs.value;
    if (hasLs && hasFs) {
      if ((ls.fingerprint ?? "ls_none") === (fs.fingerprint ?? "fs_none")) return "MATCH";
      return "MISMATCH";
    }
    if (hasLs || hasFs) return "MISSING_ONE_SIDE";
    return "ERROR";
  }
}
