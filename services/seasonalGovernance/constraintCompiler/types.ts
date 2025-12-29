
import { GateCondition } from "../types";

/**
 * ⚙️ SEASONAL GOVERNANCE — COMPILER TYPES
 * ========================================
 */

export interface CompiledSeasonConstraints {
  seasonId: string; // "S1"
  appliedAtMs: number;
  source: "SEASON_GATE_CONDITIONAL";
  schemaVersion: "v1";

  overrides: {
    caps?: {
      maxShare?: number;
    };
    delays?: {
      distributionDelayMs?: number;
    };
    exclusions?: {
      communities?: string[];
    };
    governance?: {
      maxStewards?: number;
    };
    signalFilters?: {
      disabledSignalTypes?: string[];
    };
  };

  hashes: {
    gateHash: string;
    compiledHash: string;
  };

  irreversible: true;
}
