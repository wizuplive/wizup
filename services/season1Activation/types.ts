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
  | "CONSTRAINTS_HASH_MISSING"
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
