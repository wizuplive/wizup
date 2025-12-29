
import { CompiledSeasonConstraints } from "../../seasonalGovernance/constraintCompiler/types";
import { ZapsSignalEvent } from "../../zapsSignals/types/zapsSignals.types";
import { CommunityTreasuryLedger } from "../../communityTreasury/types";

/**
 * 🧠 CONSTRAINT-AWARE RESOLUTION — TYPES
 * =====================================
 */

export interface ConstraintCheckResult {
  kind: "CAP" | "EXCLUSION" | "SIGNAL_FILTER" | "GOVERNANCE_LIMIT" | "DELAY";
  status: "PASS" | "FAIL";
  details?: string;
}

export interface ResolutionInputs {
  signals: ZapsSignalEvent[];
  treasuries: Record<string, CommunityTreasuryLedger>;
  timestamp: number;
}

export interface AllocationEntry {
  communityId: string;
  userId: string;
  finalShare: number;
}

export interface ConstraintAwareResolutionArtifact {
  seasonId: string;
  allocations: AllocationEntry[];
  constraintProofs: {
    constraintHash: string;
    checks: ConstraintCheckResult[];
  };
  hashes: {
    inputHash: string;
    constraintHash: string;
    outputHash: string;
    engineVersion: string;
  };
  verdict: "COMPLIANT";
}
