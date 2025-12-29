export type SeasonAuditVerdict = "PASS" | "PASS_WITH_WARNINGS" | "FAIL";

export type SeasonAuditItem = {
  seasonId: string;
  communityId: string;

  // Deterministic result classification
  result: "OK" | "FAIL" | "SKIP";

  // Verifier-specific verdict
  status?: string;

  // Stable hashes for audit trail
  bundleHash?: string | null;
  receiptHash?: string | null;
  constraintsHash?: string | null;

  notes?: string[];
};

export interface SeasonAuditSummaryArtifact {
  schemaVersion: "v1";
  seasonId: string;

  // Timestamp of generation (excluded from summaryHash input)
  generatedAtMs: number;

  // Aggregate stats
  totals: {
    communitiesIndexed: number;
    communitiesVerified: number;
    ok: number;
    fail: number;
    skipped: number;
  };

  // The high-level moral verdict
  verdict: SeasonAuditVerdict;

  // Cryptographic fingerprints
  hashes: {
    indexHash: string;    // hash of canonicalized index entries used
    summaryHash: string;  // hash of summary payload (excluding generatedAtMs)
    runnerVersion: string;
  };

  // Stable list of per-community results (sorted)
  items: SeasonAuditItem[];

  warnings?: string[];
}