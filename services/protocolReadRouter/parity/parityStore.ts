import type { ParityReportArtifact } from "./parityTypes";

/**
 * 🏺 PARITY REPORT STORE
 */

const INDEX_KEY = "wizup:protocol:parity:index:v1";
const DOC_KEY_PREFIX = "wizup:protocol:parity:doc:v1:";

export class ParityReportStore {
  write(report: ParityReportArtifact): void {
    try {
      const max = 50;
      localStorage.setItem(`${DOC_KEY_PREFIX}${report.id}`, JSON.stringify(report));

      const idxRaw = localStorage.getItem(INDEX_KEY);
      const idx: string[] = idxRaw ? JSON.parse(idxRaw) : [];
      const next = [report.id, ...idx.filter((x) => x !== report.id)].slice(0, max);
      localStorage.setItem(INDEX_KEY, JSON.stringify(next));
    } catch {
      // fail-open
    }
  }
}
