
/**
 * 🔒 SEASON 1 READINESS PIPELINE — TYPES
 * =====================================
 * Services-only. Non-negotiable.
 */

export type ReadinessDecision = "PROCEED" | "ABORT";

// Added ReadinessReasonCode union for semantic error tracking
export type ReadinessReasonCode =
  | "MISSING_ACTIVATION_CONTRACT"
  | "CONTRACT_ALREADY_SEALED"
  | "MISSING_MORAL_VERDICT"
  | "MORAL_BLOCK"
  | "MORAL_CONDITIONAL_REQUIRES_ACCEPTANCE"
  | "MISSING_AUDIT_SUMMARY"
  | "AUDIT_FAIL"
  | "AUDIT_WARNINGS_PRESENT"
  | "HASH_INPUT_INCOMPLETE"
  | "VERIFICATION_VIOLATION_PRESENT";

// Added ReadinessVerdictInputSnapshot for deterministic input fingerprinting
export interface ReadinessVerdictInputSnapshot {
  seasonId: string;
  activationContract: {
    present: boolean;
    sealed: boolean;
    contractHash: string | null;
    version: string | null;
  };
  moralGate: {
    present: boolean;
    verdict: string | null;
    moralHash: string | null;
    conditionsHash: string | null;
  };
  auditSummary: {
    present: boolean;
    verdict: string | null;
    summaryHash: string | null;
    totals: {
      communitiesIndexed: number;
      ok: number;
      fail: number;
      skipped: number;
    } | null;
  };
}

// Updated ReadinessDecisionArtifact to accommodate multiple internal implementation versions
export interface ReadinessDecisionArtifact {
  schemaVersion: "v1";
  seasonId: string;
  decision: ReadinessDecision;
  reasons: (string | ReadinessReasonCode)[];
  
  // Timestamps
  createdAtMs?: number;
  generatedAtMs?: number;

  // From readinessAggregator implementation
  inputs?: {
    contractHash: string;
    moralVerdictHash: string;
    constraintsHash: string;
    auditSummaryHash: string;
  };
  decisionHash?: string;

  // From readinessGateAggregator implementation
  hashes?: {
    inputHash: string;
    decisionHash: string;
    runnerVersion: string;
  };
  notes?: string[];
}

export type ReadinessFlags = {
  WRITE_S1_READINESS_LOCAL: boolean;
  WRITE_S1_READINESS_FIRESTORE: boolean;
};
