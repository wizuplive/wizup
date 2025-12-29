export type Season2Status = "CANDIDATE" | "READY";

export type Season2CandidateContract = {
  schemaVersion: "v1";
  seasonId: string;            // e.g. "S2_YYYY-MM"
  prevSeasonId: string;        // from seed
  status: Season2Status;

  // lineage: ONLY from seed
  lineage: {
    readinessSeedHash: string;     // hash of seed payload (canonical)
    prevArchiveHash?: string;      
    prevEndReceiptHash?: string;   
    finalConstraintsHash?: string; 
  };

  // proposed fixed time window
  window: { startMs: number; endMs: number };

  // frozen params snapshot
  parameters: Record<string, unknown>;

  builder: {
    builderVersion: string; // "season2ContractBuilder@v1"
    builtAtMs: number;      // excluded from hash input
  };

  hashes: {
    seedHash: string;         
    contractHash: string;     // canonical hash of contract (excluding builtAtMs)
  };
};

export type ArchitectAcknowledgement = {
  schemaVersion: "v1";
  seasonId: string;
  contractHash: string;       // must match the candidate’s contractHash
  actor: "ARCHITECT";
  intent: "ACK_READY";
  ackAtMs: number;            // excluded from hash input
  ackHash: string;            // hash of canonical ack payload (excluding ackAtMs)
};

export type Season2ViolationCode = 
  | "IMMUTABILITY_VIOLATION"
  | "HASH_MISMATCH"
  | "READY_WITHOUT_ACK"
  | "ACK_FOR_UNKNOWN_CANDIDATE"
  | "SEED_MISSING"
  | "SEED_HASH_DRIFT";

export interface Season2ViolationArtifact {
  id: string;
  seasonId: string;
  code: Season2ViolationCode;
  occurredAtMs: number;
  details: Record<string, unknown>;
}
