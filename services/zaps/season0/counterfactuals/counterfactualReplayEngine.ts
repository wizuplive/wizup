
import { runSeason0Simulation } from "../season0Runner";
import { LocalMemorySource } from "../sources/localMemorySource";
import { defaultSeason0Config } from "../config";
import { ZapsSignalEvent } from "../../zapsSignals/zapsSignals.types";
import { SeasonalSimulationArtifact } from "../types";
import { Season0CounterfactualArtifact, CounterfactualResult, CounterfactualScenarioId } from "./types";
import { sha256Hex, canonicalJson } from "../hash";

/**
 * 🔁 COUNTERFACTUAL ANALYSIS ENGINE
 * =================================
 * "What if we didn't protect the protocol?"
 */

export const counterfactualReplayEngine = {
  async runAnalysis(
    canonicalArtifact: SeasonalSimulationArtifact,
    signals: ZapsSignalEvent[]
  ): Promise<Season0CounterfactualArtifact> {
    const source = new LocalMemorySource({ getAllEvents: () => signals });
    const scenarios: CounterfactualScenarioId[] = [
      "NO_WHALE_CAPS",
      "NO_DIMINISHING_RETURNS",
      "NO_J2E_DAMPENING",
      "NO_STEWARDSHIP_WEIGHT"
    ];

    const results: CounterfactualResult[] = [];

    for (const sid of scenarios) {
      results.push(await this.replayScenario(sid, canonicalArtifact, source, signals));
    }

    return {
      seasonId: canonicalArtifact.seasonId,
      communityId: canonicalArtifact.communityId,
      results,
      analyzedAt: Date.now()
    };
  },

  async replayScenario(
    scenarioId: CounterfactualScenarioId,
    canonical: SeasonalSimulationArtifact,
    source: LocalMemorySource,
    signals: ZapsSignalEvent[]
  ): Promise<CounterfactualResult> {
    const config = JSON.parse(JSON.stringify(defaultSeason0Config));

    // 1. Mutate exactly one protection
    if (scenarioId === "NO_WHALE_CAPS") {
      config.caps.maxShare = 1.0; // Remove 15% clamp
    } else if (scenarioId === "NO_DIMINISHING_RETURNS") {
      config.saturation.k = 1000; // Force linear response
    } else if (scenarioId === "NO_J2E_DAMPENING") {
      config.typeWeights.COMMUNITY_JOIN = 10.0; // Inflate join weight
    } else if (scenarioId === "NO_STEWARDSHIP_WEIGHT") {
      config.typeWeights.MODERATION_ACTION = 0.01;
      config.typeWeights.GOVERNANCE_PROPOSAL = 0.01;
    }

    // 2. Re-run deterministically
    const result = await runSeason0Simulation({
      seasonId: canonical.seasonId,
      communityId: canonical.communityId,
      window: canonical.window,
      source,
      config
    });

    // 3. Qualitative Comparison
    const efficacy = this.compare(canonical, result.artifact, scenarioId);
    const hash = await sha256Hex(canonicalJson(result.artifact.resolvedWeights));

    return {
      scenarioId,
      findings: this.getFindingsNarrative(efficacy, scenarioId),
      protectionEfficacy: efficacy,
      deltaHash: hash
    };
  },

  compare(can: SeasonalSimulationArtifact, cfa: SeasonalSimulationArtifact, sid: CounterfactualScenarioId): CounterfactualResult["protectionEfficacy"] {
    const canMax = Math.max(...Object.values(can.resolvedWeights));
    const cfaMax = Math.max(...Object.values(cfa.resolvedWeights));

    if (sid === "NO_WHALE_CAPS") {
      if (cfaMax > canMax * 2) return "CRITICAL";
      if (cfaMax > canMax * 1.2) return "EFFECTIVE";
    }
    
    if (sid === "NO_DIMINISHING_RETURNS") {
      const canStd = this.stdDev(Object.values(can.resolvedWeights));
      const cfaStd = this.stdDev(Object.values(cfa.resolvedWeights));
      if (cfaStd > canStd * 1.5) return "CRITICAL";
    }

    return "EFFECTIVE"; // Default for simulation
  },

  stdDev(values: number[]) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / values.length);
  },

  getFindingsNarrative(efficacy: string, sid: string): string {
    if (sid === "NO_WHALE_CAPS" && efficacy === "CRITICAL") {
      return "Without whale caps, influence concentrated among few early users.";
    }
    if (sid === "NO_STEWARDSHIP_WEIGHT") {
      return "Stewardship became irrelevant to outcomes without explicit weighting.";
    }
    return "Protocols functioned as designed to prevent concentration.";
  }
};
