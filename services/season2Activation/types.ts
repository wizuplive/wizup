/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

export type ActivationStatus = "ACTIVATED" | "REFUSED" | "ERROR";

export type ActivationFailureCode =
  | "READINESS_NOT_PROCEED"
  | "MISSING_CONTRACT"
  | "CONTRACT_ALREADY_SEALED"
  | "MISSING_CONSTRAINTS"
  | "NON_DETERMINISTIC_RESOLUTION"
  | "WRITE_FAILED"
  | "UNKNOWN"
  | "READINESS_MISSING"
  | "READINESS_HASH_MISMATCH"
  | "CONSTRAINTS_HASH_MISMATCH"
  | "RESOLUTION_FAILED"
  | "WRITE_FAILED";

export type ActivationReceiptV1 = {
  schemaVersion: "v1";
  seasonId: string;
  status: ActivationStatus;
  reasonCode?: ActivationFailureCode;

  // Hash-pinned inputs
  decisionHash: string;           // from ReadinessDecision (must be PROCEED)
  contractHash: string;           // base contract hash pre-seal
  constraintsHash: string;        // compiled constraints snapshot hash
  moralVerdictHash: string;       // conscience layer / moral gate artifact hash
  batchAuditHash: string;         // batch verifier summary hash

  // Sealing outputs
  sealedContractHash: string;     // hash of sealed contract payload
  sealHash: string;               // hash(seasonId + contractHash + decisionHash + constraintsHash + resolutionHash)
  resolutionOutputHash: string;   // hash of constraint-aware resolution artifact

  // Determinism check
  determinism: {
    run1: string; // outputHash
    run2: string; // outputHash
    ok: boolean;
  };

  writtenAtMs: number; 
};

// --- Missing types added to fix compilation errors ---

// Fix for services/season1Activation/season1StateMachine.ts
export type Season1State = "DORMANT" | "ARMED" | "ACTIVE" | "SEALED" | "FINALIZED" | "FROZEN";

// Fix for services/season1Activation/season1LockService.ts, season1EnforcementGuards.ts, season1Finalizer.ts, season1Contract.ts
export interface Season1ActivationContract {
  seasonId: string;
  timeWindow: { startMs: number; endMs: number };
  frozenInputs: {
    legitimacyVerdictHash: string;
    compiledConstraintsHash: string;
    resolutionEngineHash: string;
    treasuryRulesetHash: string;
    spendIntentsHash: string;
  };
  invariants: {
    noRuleChanges: boolean;
    noManualOverrides: boolean;
    noEarlyTermination: boolean;
    noPostHocEdits: boolean;
  };
  createdAtMs: number;
  signedBy: string;
  activationHash: string;
  sealed?: boolean;
}

// Fix for services/season1Activation/verdictResolver.ts and season1ReadinessEngine.ts
export type ReadinessVerdict = "PROCEED" | "DELAY" | "ABORT_FOREVER";

// Fix for services/season1Activation/verdictResolver.ts and season1ReadinessEngine.ts
export type ReadinessFailureCode =
  | "MISSING_PREREQUISITE_ARTIFACT"
  | "HASH_MISMATCH"
  | "ESCAPE_HATCH_DETECTED"
  | "ABORT_UNSAFE"
  | "CONSTRAINTS_NOT_COMPILED"
  | "UNKNOWN_ERROR";

// Fix for services/season1Activation/checks/*.ts
export interface ReadinessCheckResult {
  name: string;
  severity: "FATAL" | "FAIL" | "WARN";
  pass: boolean;
  code?: ReadinessFailureCode;
  details?: any;
}

// Fix for services/season1Activation/persistence/readinessSink.ts, localStorageReadinessSink.ts, season1ReadinessEngine.ts, activationEligibility.ts
export interface ActivationReadinessArtifact {
  schemaVersion: "v1";
  seasonId: string;
  generatedAtMs: number;
  required: {
    season0LegitimacyVerdictHash?: string;
    season1ActivationContractHash?: string;
    season1ConstraintsCompiledHash?: string;
  };
  checks: ReadinessCheckResult[];
  verdict: {
    decision: ReadinessVerdict;
    reason: string;
    blockingCodes: ReadinessFailureCode[];
  };
  hashes: {
    inputHash: string;
    outputHash: string;
    runnerVersion: string;
  };
}

// Fix for services/season1Activation/sinks/activationReceiptSink.ts and activationOrchestrator.ts
export interface Season1ActivationReceipt {
  schemaVersion: "v1";
  seasonId: string;
  decision: "ACTIVATED" | "ABORTED";
  readinessDecisionHash: string;
  readinessInputHash: string | null;
  contract: {
    unsealedContractHash: string;
    sealedContractHash: string;
  };
  constraintsHash: string;
  resolutionArtifactHash: string;
  determinism: {
    run1Hash: string;
    run2Hash: string;
    ok: boolean;
  };
  generatedAtMs: number;
  failures?: { code: string }[];
}

/**
 * 🔒 SEASON 2 VIOLATION CODES
 * ===========================
 */
export type Season2ViolationCode =
  | "S2_READY_MISSING"
  | "S2_ACK_MISSING"
  | "S2_HASH_MISMATCH"
  | "S2_IMMUTABILITY_VIOLATION"
  | "S2_ALREADY_ACTIVATED"
  | "S2_WINDOW_INVALID"
  | "S2_TIME_OUTSIDE_WINDOW"
  | "S2_GATE_BLOCKED_NO_ACTIVATION"
  | "S2_NOT_ACTIVATED"
  | "S2_OUTSIDE_WINDOW"
  | "S2_POST_ACTIVATION_MUTATION"
  | "S2_FREEZE_DRIFT_DETECTED"
  | "S2_CANON_REGISTRY_HASH_MISMATCH"
  | "S2_NOOP_LATCHED";

export interface Season2ViolationArtifact {
  id: string;
  seasonId: string;
  code: Season2ViolationCode;
  occurredAtMs: number;
  details: Record<string, unknown>;
}

// Fix: Added missing Season2SealedContract and Season2ActivationReceipt exports
export interface Season2SealedContract {
  schemaVersion: "v1";
  seasonId: string;
  sealedFrom: {
    readyContractHash: string;
    architectAckHash: string;
  };
  window: { startMs: number; endMs: number };
  parameters: Record<string, unknown>;
  lineage: {
    readinessSeedHash: string;
    prevArchiveHash?: string;
    prevEndReceiptHash?: string;
    finalConstraintsHash?: string;
  };
  sealer: {
    sealerVersion: string;
    sealedAtMs: number;
  };
  hashes: {
    sealHash: string;
  };
}

export interface Season2ActivationReceipt {
  schemaVersion: "v1";
  seasonId: string;
  decision: "ACTIVATED" | "ABORTED";
  readyContractHash: string;
  sealedContractSealHash: string;
  architectAckHash: string;
  notes: string[];
  activationHash: string;
  writtenAtMs: number;
}
