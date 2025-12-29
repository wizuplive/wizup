import { AllocationWeightLabel, AllocationExplanation } from "./types";
import { ZapsSignalEvent } from "../zapsSignals/zapsSignals.types";

export const explainability = {
  getLabel(weightNormalized: number): AllocationWeightLabel {
    if (weightNormalized > 0.9) return "TOP";
    if (weightNormalized > 0.6) return "HIGH";
    if (weightNormalized > 0.3) return "MEDIUM";
    if (weightNormalized > 0.1) return "LOW";
    return "MICRO";
  },

  generateUserExplanation(userId: string, signals: ZapsSignalEvent[]): AllocationExplanation {
    const highlights: string[] = [];
    const flags: string[] = [];
    let lane: AllocationExplanation["lane"] = "NOMINAL";

    const types = new Set(signals.map(s => s.type));
    
    if (types.has("GOVERNANCE_VOTE")) highlights.push("Civic participation present");
    if (types.has("MODERATION_ACTION")) highlights.push("Moderation stewardship detected");
    if (signals.length > 50) {
      highlights.push("High-frequency engagement");
      flags.push("Volume-dampening applied");
      lane = "DAMPENED";
    }
    
    const daySpread = new Set(signals.map(s => new Date(s.ts).toDateString())).size;
    if (daySpread > 10) {
      highlights.push("Consistent seasonal presence");
      lane = "ELEVATED";
    }

    return {
      headline: signals.length > 20 ? "Consistent Community Builder" : "Active Participant",
      highlights,
      flags: flags.length > 0 ? flags : undefined,
      lane
    };
  }
};
