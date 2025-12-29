
/**
 * ⚖️ SEASONAL GOVERNANCE — GATE TYPES
 * ===================================
 */

export type MoralVerdict = "ALLOW" | "CONDITIONAL" | "BLOCK";

export type GateCondition =
  | { kind: "CAP_LOWERING"; target: "MAX_SHARE"; value: number }
  | { kind: "DISTRIBUTION_DELAY"; delayMs: number }
  | { kind: "COMMUNITY_EXCLUSION"; communityId: string }
  | { kind: "STEWARD_LIMIT"; maxStewards: number }
  | { kind: "SIGNAL_TYPE_DISABLED"; signalType: string };

export interface SeasonGateState {
  seasonId: string;          // "S1"
  priorSeasonId: string;     // "S0"
  verdict: MoralVerdict;
  issuedAtMs: number;
  issuedBy: "SYSTEM_CONSCIENCE";
  conditions?: GateCondition[];
  irreversible: true;
  hashes: {
    conscienceHash: string;
    gateStateHash: string;
  };
}
