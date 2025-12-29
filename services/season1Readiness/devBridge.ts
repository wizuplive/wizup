import { runBatchVerification } from "./batchVerificationRunner";
import { aggregateReadiness } from "./readinessAggregator";
import { readinessPersistence } from "./persistence";
import { ReadinessFlags } from "./types";

/**
 * 🛠️ SEASON 1 READINESS DEV BRIDGE
 */

let globalFlags: () => ReadinessFlags = () => ({
  WRITE_S1_READINESS_LOCAL: true,
  WRITE_S1_READINESS_FIRESTORE: false
});

export function installSeason1ReadinessDevBridge(args: {
  enabled: boolean;
  flags: () => ReadinessFlags;
}) {
  if (!args.enabled) return;
  globalFlags = args.flags;

  const w = window as any;
  w.wizup = w.wizup || {};

  w.wizup.runSeason1Readiness = async (seasonId: string) => {
    console.log(`%c[READINESS] Starting pipeline for ${seasonId}...`, "color: #8b5cf6; font-weight: bold;");
    
    try {
      // 1. Run Batch Verification
      const summary = await runBatchVerification(seasonId, globalFlags());
      console.log(`%c[READINESS] Audit summary generated. Verdict: ${summary.verdict}`, "color: #3b82f6;");

      // 2. Aggregate Decision
      const decision = await aggregateReadiness(seasonId, summary, globalFlags());
      
      const logColor = decision.decision === "PROCEED" ? "#22c55e" : "#ef4444";
      console.log(`%c[READINESS] Decision: ${decision.decision}`, `color: ${logColor}; font-weight: bold;`);
      if (decision.reasons.length > 0) {
        console.log(`%c[READINESS] Reasons: ${decision.reasons.join(", ")}`, "color: #999;");
      }
      
      return { 
        decision: decision.decision, 
        decisionHash: decision.decisionHash 
      };
    } catch (e) {
      console.error("[READINESS] Pipeline failed:", e);
      return { decision: "ABORT", error: "SYSTEM_FAILURE" };
    }
  };

  w.wizup.inspectSeason1Readiness = (seasonId: string) => {
    return {
      decision: readinessPersistence.getReadinessDecision(seasonId),
      auditSummary: readinessPersistence.getAuditSummary(seasonId)
    };
  };
}
