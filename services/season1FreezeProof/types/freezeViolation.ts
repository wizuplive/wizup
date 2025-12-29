import { Season1ViolationArtifact } from "../../season1TemporalLock/types/violation";

export type FreezeViolationCode = 
  | "CANONICAL_FREEZE_DRIFT" 
  | "FREEZE_BASELINE_MISSING" 
  | "FREEZE_BASELINE_CONFLICT";

/* Fix: Omit 'attempted' from base interface to allow redefinition with incompatible property keys */
export interface Season1FreezeViolationArtifact extends Omit<Season1ViolationArtifact, 'code' | 'attempted'> {
  code: FreezeViolationCode;
  attempted: {
    objectType: "protocolState";
    baselineHash: string;
    currentHash: string;
    activationReceiptHash: string;
    details?: Record<string, unknown>;
  };
  enforcement: "SEASON_FROZEN";
}