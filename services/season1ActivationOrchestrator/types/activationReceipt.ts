/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 * Services-only / data-only / invisible to users / fail-open.
 * NO wallet mutations. NO balance materialization. NO notifications.
 * Activation is irreversible once sealed.
 * If uncertain → do nothing.
 */

export type ActivationDecision = "ACTIVATED" | "NOT_ACTIVATED";

export type ActivationFailureCode =
  | "READINESS_NOT_PROCEED"
  | "CONTRACT_MISSING"
  | "CONTRACT_ALREADY_SEALED"
  | "CONTRACT_HASH_MISMATCH"
  | "CONSTRAINTS_MISSING"
  | "CONSTRAINTS_HASH_MISMATCH"
  | "RESOLUTION_ATTESTATION_FAILED"
  | "OUTPUT_NOT_DETERMINISTIC"
  | "PERSISTENCE_FAILED"
  | "UNKNOWN_ERROR";

export type ActivationReceipt = {
  schemaVersion: "v1";
  seasonId: string;
  activatedAtMs: number;
  decision: ActivationDecision;

  failure?: {
    reason: string;
    codes?: ActivationFailureCode[];
  };

  contract: {
    contractHash: string; // Authoritative hash of sealed contract
    sealHash: string;     // Hash of the seal payload
    window: { startMs: number; endMs: number };
  };

  moralGate: {
    readinessHash: string;
    readinessDecision: "PROCEED" | "DELAY" | "ABORT_FOREVER";
  };

  constraints: {
    compiledConstraintsHash: string;
    compilerVersion?: string;
  };

  resolution: {
    resolutionArtifactHash: string;
    attestationHash: string;
    engineVersion?: string;
  };

  hashes: {
    inputHash: string;
    receiptHash: string;
    runnerVersion: string; // "season1ActivationOrchestrator@v1"
  };
};
