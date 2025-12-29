/**
 * 🔒 SEASON END & ARCHIVAL TYPES
 * ==============================
 * Standardized artifacts for the permanent closing of Season 1.
 */

export interface SeasonEndReceipt {
  schemaVersion: "v1";
  seasonId: string;
  status: "FINALIZED";
  window: { startMs: number; endMs: number };
  canonIndexHash: string;
  globalArchiveHash: string;
  batchAuditSummaryHash: string;
  freezeProofStatus: "OK" | "FROZEN";
  finalizedAtMs: number; // Volatile: Excluded from receiptHash
  receiptHash: string; // sha256 of sorted payload excluding finalizedAtMs
}

export interface SeasonArchiveCommunityEntry {
  communityId: string;
  canonBundleHash: string;
  constraintsHash: string;
  activationReceiptHash: string;
}

export interface SeasonArchiveBundle {
  schemaVersion: "v1";
  seasonId: string;
  window: { startMs: number; endMs: number };
  communities: SeasonArchiveCommunityEntry[];
  global: {
    totalCommunities: number;
    totalBundles: number;
    anomaliesDetected: boolean;
    criticalViolationsDuringSeason: boolean;
    lastBatchAuditHash: string;
  };
  archiveHash: string; // sha256 of sorted payload excluding archivedAtMs
  archivedAtMs: number; // Volatile
}

export interface Season2ReadinessSeed {
  schemaVersion: "v1";
  prevSeasonId: string;
  pointers: {
    activationContractHash: string;
    constraintsHash: string;
    archiveHash: string;
    endReceiptHash: string;
  };
  seedHash: string; // sha256 of sorted payload excluding generatedAtMs
  generatedAtMs: number; // Volatile
}
