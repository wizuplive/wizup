/**
 * 🚨 PROTOCOL CUTOVER VIOLATION TYPES
 */

export type ProtocolCutoverViolationCode =
  | "LOCALSTORAGE_PRIMARY_READ_ATTEMPT"
  | "LOCALSTORAGE_PRIMARY_WRITE_ATTEMPT"
  | "LOCALSTORAGE_MODE_DOWNGRADE_ATTEMPT"
  | "LOCALSTORAGE_ROUTER_MISCONFIG"
  | "LOCALSTORAGE_WRITE_ALLOWED_BUT_FIRESTORE_MISSING"
  | "CUTOVER_ACTIVE_BUT_FIRESTORE_UNAVAILABLE_AT_BOOT"
  | "SAFE_NOOP_LATCHED_DUE_TO_BOOT_INTEGRITY"
  | "LOCAL_PRIMARY_AFTER_CUTOVER"
  | "LOCAL_WRITE_AFTER_CUTOVER"
  | "CUTOVER_GUARDRAIL_BREACH";

export type ProtocolCutoverViolationSeverity = "CRITICAL";

export interface ProtocolCutoverViolationArtifactV1 {
  version: "v1";
  id: string; 
  severity: ProtocolCutoverViolationSeverity;
  code: ProtocolCutoverViolationCode;

  env: {
    mode: "development" | "production";
    buildTag?: string;
  };

  cutover: {
    cutoverReceiptHash?: string;
    primaryReadMode?: string | null;
  };

  context: {
    operation: "READ" | "WRITE" | "MODE_SET";
    artifactKind?: string; 
    seasonIdScope?: string;
    details?: Record<string, unknown>;
  };

  createdAtMs: number; 
}
