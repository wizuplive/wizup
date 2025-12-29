/**
 * ⚖️ PARITY GATE TYPES
 */

export type ParityGateDecision = "ALLOW" | "BLOCK";

export type ParityGateVerdict = {
  id: string;
  schemaVersion: "v1";
  seasonId: string;
  observedAtMs: number;
  decision: ParityGateDecision;
  reason: "MISMATCH_RATE_EXCEEDED" | "INSUFFICIENT_SAMPLE" | "OK";
  mismatchRate: number;
  totalChecks: number;
  mismatchCount: number;
  missingCount: number;
  threshold: number;
};
