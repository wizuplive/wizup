
import { SeasonalSimulationArtifact } from "../types";

export type CounterfactualScenarioId = 
  | "NO_WHALE_CAPS"
  | "NO_DIMINISHING_RETURNS"
  | "NO_J2E_DAMPENING"
  | "NO_STEWARDSHIP_WEIGHT";

export interface CounterfactualResult {
  scenarioId: CounterfactualScenarioId;
  findings: string;
  protectionEfficacy: "CRITICAL" | "EFFECTIVE" | "MARGINAL" | "UNNECESSARY";
  deltaHash: string;
}

export interface Season0CounterfactualArtifact {
  seasonId: string;
  communityId: string;
  results: CounterfactualResult[];
  analyzedAt: number;
}
