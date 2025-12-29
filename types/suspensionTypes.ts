
/**
 * 🛡️ SEASON 9 — CANON SUSPENSION PROTOCOL
 * =======================================
 * Data types for emergency runtime guardrails.
 */

export type SuspensionScope = 
  | { type: "GLOBAL" }
  | { type: "COMMUNITY"; communityId: string }
  | { type: "SIGNAL_CLASS"; signalClass: string };

export interface CanonSuspension {
  suspensionId: string;
  canonId: string; // The ID of the canon parameter being suspended
  parameterKey: string;
  scope: SuspensionScope;
  reason: string;
  initiatedBy: {
    systemAuthority: string;      // Founder / Incident Commander
    institutionalAuthority: string; // Council Chair / Delegate
  };
  initiatedAt: number;
  maxDurationMs: number;         // Default 72 hours
  reviewDeadline: number;        // initiatedAt + duration
  status: "ACTIVE" | "EXPIRED" | "RESOLVED";
  resolution?: {
    outcome: "REINSTATED" | "SUPERSEDED" | "ROLLED_BACK" | "EXPERIMENT_AUTH";
    resolvedAt: number;
    resolvedBy: string;
    notes: string;
  };
}

export interface SystemIntegrityStatus {
  isValid: boolean;
  errors: string[];
  lastCheckedAt: number;
}
