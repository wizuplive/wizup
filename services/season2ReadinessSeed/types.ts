/**
 * 🔒 SEASON 2 READINESS SEED — TYPES
 * schemaVersion: "s2-seed-v1"
 */

export interface Season2ReadinessSeed {
  schemaVersion: "s2-seed-v1";
  fromSeasonId: string;
  toSeasonIdHint?: string;
  pointers: {
    seasonEndReceiptHash: string;
    archiveBundleHash: string;
    finalConstraintsHash?: string;
  };
  hashes: {
    inputHash: string;   // Canonical hash of stable S1 artifact inputs
    seedHash: string;    // Canonical hash of seed payload (minus volatile fields)
    runnerVersion: "season2Seed@v1";
  };
  createdAtMs: number;   // Volatile: excluded from hash input
}

export interface SeedVerificationResult {
  ok: boolean;
  reason?: string;
  seedHash?: string;
}