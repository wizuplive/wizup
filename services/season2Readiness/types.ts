/**
 * 🔒 SEASON 2 READINESS — TYPE CANON
 * ==================================
 * schemaVersion: "s2-candidate-v1"
 */

export type Season2ReadinessStatus = "CANDIDATE" | "READY";

export interface Season2CandidateContract {
  schemaVersion: "s2-candidate-v1";
  seasonId: string;              
  derivedFrom: {
    season1Id: string;
    archiveBundleHash: string;
    endReceiptHash: string;
    finalConstraintsHash: string;
  };

  // Proposed locked params for Season 2
  proposed: {
    parametersSnapshot: Record<string, any>;
    constraintsSnapshot: Record<string, any>;
    rationale?: string[];
  };

  // State machine and Auth
  status: Season2ReadinessStatus;
  acknowledgement?: {
    acknowledgedBy: "ARCHITECT";
    acknowledgedAtMs: number;    // Volatile
    note?: string;
    acknowledgementHash: string; // Deterministic link
  };

  hashes: {
    inputHash: string;    // Fingerprint of S1 sources
    proposalHash: string; // Fingerprint of proposed params
    contractHash: string; // Fingerprint of contract (minus volatile/ack)
    runnerVersion: string; // "season2Readiness@v1"
  };

  createdAtMs: number; // Volatile
}

export interface ReadinessGateResult {
  ready: boolean;
  contractHash?: string;
  proposalHash?: string;
  inputHash?: string;
  error?: string;
}
