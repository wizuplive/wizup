import { SpendIntentCategory } from "../../zapsSpend/types";

export type SpendClass = "MICRO" | "ROUTINE" | "SIGNIFICANT" | "STRUCTURAL";

export interface SimulatedActor {
  id: string;
  role: "OWNER" | "STEWARD" | "INFLUENCER" | "MEMBER";
  trustScore: number; // 0-1
  isInactive?: boolean;
}

export interface SimulatedTreasuryState {
  balance: number;
  isFrozen: boolean;
  recentSpendVelocity: number; // ZAPS per hour (simulated)
  lastSpendAt: number;
  stewardRepetitionMap: Record<string, number>; // "owner_id:steward_id" -> count
}

export interface SpendScenario {
  id: string;
  name: string;
  setup: {
    treasury: SimulatedTreasuryState;
    actors: SimulatedActor[];
    intents: {
      category: SpendIntentCategory;
      spendClass: SpendClass;
      amount: number;
      frequency: "ONCE" | "REPEATED_BURST" | "PERIODIC";
      approvers: string[]; // IDs of actors who approve
    }[];
  };
  expectedOutcome: string;
}

export interface SimulationResult {
  scenarioId: string;
  passed: boolean;
  reason: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  riskFlags: string[];
  suggestedGuardrail?: string;
  auditTrail: string[];
}