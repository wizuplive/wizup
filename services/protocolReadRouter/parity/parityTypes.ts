/**
 * ⚖️ PARITY WATCHDOG TYPES
 */

export type ParityStatus = "MATCH" | "MISMATCH" | "MISSING_ONE_SIDE" | "ERROR";

export type ParityReportEntry = {
  kind: string;
  seasonId: string;
  communityId?: string;
  status: ParityStatus;
  lsFingerprint?: string;
  fsFingerprint?: string;
  observedAtMs: number;
  notes?: string[];
};

export type ParityReportArtifact = {
  id: string;
  schemaVersion: "v1";
  observedAtMs: number;
  entries: ParityReportEntry[];
};
