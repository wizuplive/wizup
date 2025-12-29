/**
 * 🚨 PROTOCOL VIOLATION TYPES
 */

export type ProtocolViolationSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ProtocolViolationCode =
  | "DUAL_READ_LATCH_BLOCKED_FIRESTORE_FIRST_ATTEMPT"
  | "DUAL_READ_LATCH_BLOCKED_FIRESTORE_FALLBACK_ATTEMPT";

export type ProtocolViolationArtifact = {
  id: string;
  schemaVersion: "v1";
  seasonId: string;
  occurredAtMs: number;

  severity: ProtocolViolationSeverity;
  code: ProtocolViolationCode;

  context: {
    kind: string;
    communityId?: string;
    note?: string;
  };

  // Deterministic fingerprint of the violation content
  violationHash: string;
};
