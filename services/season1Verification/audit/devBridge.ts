import { runSeason1BatchVerification } from "./season1BatchVerificationRunner";
import { LocalStorageAuditSummarySink } from "./sinks/localStorageAuditSummarySink";

/**
 * 🛠️ SEASON 1 BATCH AUDIT DEV BRIDGE
 */
export function installSeason1AuditDevBridge(args: {
  enabled: boolean;
  flags: () => {
    WRITE_S1_AUDIT_LOCAL: boolean;
    WRITE_S1_AUDIT_FIRESTORE: boolean;
  };
}) {
  try {
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (!isDev || !args.enabled) return;

    const w = window as any;
    w.wizup = w.wizup || {};

    const reader = new LocalStorageAuditSummarySink();

    w.wizup.verifySeason1All = async (seasonId: string) => {
      console.log(`%c[AUDIT] Starting batch verification for ${seasonId}...`, "color: #3b82f6; font-weight: bold;");
      const summary = await runSeason1BatchVerification({
        seasonId,
        flags: args.flags,
        includeBundleHashes: true,
      });
      console.log(`%c[AUDIT] Batch complete. Verdict: ${summary.verdict}`, "color: #22c55e; font-weight: bold;");
      return summary;
    };

    w.wizup.listSeason1AuditSummaries = () => reader.listSeasons();
    w.wizup.inspectSeason1AuditSummary = (seasonId: string) => reader.read(seasonId);

  } catch {
    // swallow
  }
}