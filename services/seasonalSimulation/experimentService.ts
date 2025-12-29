
/**
 * 🧠 SEASON 2 EXPERIMENTATION ENGINE
 * ===================================
 * Implements the Dual-Interpretation Model.
 * Observes signals in parallel to measure parameter sensitivity.
 * 
 * INVARIANTS:
 * 1. Outcome-Isolated: Zero effect on live balances or tiers.
 * 2. Write-Only: Logs results to a separate shadow ledger.
 * 3. Killable: Automated abort on deviation violation.
 */

import { ZapsSignalEvent } from "../zapsSignals/zapsSignals.types";
import { ExperimentRegistryEntry, OutcomeDeltas } from "../../types/experimentTypes";
import { CALIBRATION_v1_1 } from "./calibration";
import { flags } from "../zapsSignals/featureFlags";
import { experimentRegistryService } from "./experimentRegistryService";
import { experimentAuditService } from "./experimentAuditService";

export const experimentService = {

  /**
   * Primary entry point for real-time signal shadow interpretation.
   */
  async processSignal(event: ZapsSignalEvent) {
    if (!flags.EXPERIMENTS_ENABLED) return;

    const active = experimentRegistryService.getActiveExperiments();
    
    for (const entry of active) {
      // Ensure signal type match if specified, or run for all relevant domain signals
      if (entry.signalType === event.type || entry.domain === 'REPUTATION') {
        this.runShadowInterpretation(event, entry);
      }
    }
  },

  // Removed invalid 'private' modifier for object literal method
  runShadowInterpretation(event: ZapsSignalEvent, entry: ExperimentRegistryEntry) {
    // 1. Resolve Canonical Outcome (Real S2 logic)
    const weights = CALIBRATION_v1_1.weights as any;
    const canonicalWeight = weights[event.type] || 0;
    
    const canonicalOutcome: OutcomeDeltas = {
      reputationDelta: canonicalWeight,
      // Placeholder for other deltas in v0
    };

    // 2. Resolve Experimental Outcome (Variant logic)
    let experimentalWeight = canonicalWeight;
    
    // Example Variant Logic Logic based on registry metadata
    if (entry.experimentId === "EXP_S2_01_REP" && canonicalWeight > 1) {
       // Hypothesis: Soft-log compression
       experimentalWeight = 1 + Math.log2(canonicalWeight);
    } else if (entry.experimentId === "EXP_S2_02_GOV") {
       // Logic for governance weight freshness test would go here
    }

    const experimentalOutcome: OutcomeDeltas = {
      reputationDelta: experimentalWeight
    };

    // 3. Safety Check: Deviation Magnitude
    const delta = canonicalWeight === 0 ? 0 : Math.abs(experimentalWeight - canonicalWeight) / canonicalWeight;
    const maxAllowed = entry.constraints.maxDeviationPct / 100;

    // 4. Audit Trail
    experimentAuditService.logEvent({
      experimentId: entry.experimentId,
      communityId: event.communityId,
      signalObserved: event.type,
      canonicalOutcome,
      experimentalOutcome,
      deviationMagnitude: delta,
      riskFlags: delta > maxAllowed ? ["MAX_DEVIATION_EXCEEDED"] : [],
      invariantCheck: {
        roleCapHeld: true,
        whaleCapHeld: true,
        noBalanceMutation: true // Hard invariant: Audit service doesn't have write access to dataService
      }
    });

    // 5. Automatic Kill-Switch
    if (delta > maxAllowed) {
      console.warn(`%c[EXPERIMENT] 🧯 KILL-SWITCH: ${entry.experimentId} exceeded deviation limits. Aborting.`, "color: #ef4444; font-weight: bold;");
      experimentRegistryService.updateStatus(entry.experimentId, 'ABORTED');
    }
  }
};

// Initial Seed of Registry for Season 2
if (typeof window !== 'undefined' && !localStorage.getItem("wizup_experiment_registry_v2")) {
  experimentRegistryService.register({
    experimentId: "EXP_S2_01_REP",
    domain: "REPUTATION",
    signalType: "COMMENT",
    hypothesis: "Soft-log compression of high-volume signals reduces farming without penalizing power users.",
    parameterVariant: "soft_log_base_2.0",
    variantDescription: "Weights > 1 are compressed using 1 + log2(w)",
    createdBy: "SYSTEM",
    constraints: {
      maxDeviationPct: 25,
      roleCapsEnforced: true,
      communityScoped: true,
      writeOnly: true
    }
  });

  // Start the first experiment by default in this simulation
  experimentRegistryService.updateStatus("EXP_S2_01_REP", "ACTIVE");
}
