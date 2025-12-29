export type Season1CanonBundle = {
  seasonId: string;
  communityId: string;

  // The root of trust for immutability.
  bundleHash: string;

  // Deterministic inputs (dev/audit)
  receiptHash: string;
  constraintsHash: string;
  signalsSnapshotHash: string;
  configHash: string;

  // Canon outputs
  resolutionOutputHash: string;

  // Optional payloads (dev-only; allowed)
  payload?: unknown;

  schemaVersion: "v1";
  writtenAtMs?: number; // Must not be part of hash input
};
