export type TemporalLockVerdict = "ALLOW" | "BLOCK";

export type TemporalViolationCode =
  | "S2_NOT_ACTIVATED"
  | "S2_WINDOW_INVALID"
  | "S2_OUTSIDE_WINDOW"
  | "S2_POST_ACTIVATION_MUTATION"
  | "S2_FREEZE_DRIFT_DETECTED"
  | "S2_CANON_REGISTRY_HASH_MISMATCH"
  | "S2_NOOP_LATCHED";

export type Season2TemporalLockProof = {
  schemaVersion: "v1";
  seasonId: string;
  sealHash: string; // from sealed contract
  window: { startMs: number; endMs: number };
  generatedAtMs: number; // excluded from proofHash input
  proofHash: string; // hash(canonical payload excluding generatedAtMs)
  verdict: TemporalLockVerdict;
  notes?: string[]; // qualitative only
};

export type Season2NoopLatch = {
  latched: true;
  reasonCode: string;
  violationId: string;
  latchedAtMs: number;
};
