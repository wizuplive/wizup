/**
 * 🩺 SEASON HEALTH ARTIFACT v1
 * ============================
 */

export type SeasonHealthArtifactV1 = {
  schemaVersion: "v1";
  seasonId: string;             // e.g. "S2_2026Q1"
  createdAtMs: number;          // excluded from hash input
  buildTag?: string;            // excluded from hash input

  status: "HEALTHY" | "WARN" | "CRITICAL" | "NOOP_LATCHED";

  gates: {
    activated: boolean;         
    finalized?: boolean;        
    withinWindow?: boolean;     
  };

  noopLatch: {
    latched: boolean;
    reason?: string;
    triggeredAtMs?: number;
    latchHash?: string;
  };

  freezeProof: {
    supported: boolean;
    ok?: boolean;               
    registryHash?: string;      
    expectedRegistryHash?: string;
    lastCheckedAtMs?: number;   // excluded from hash input
    driftCode?: string;         
  };

  runtimeIntegrity: {
    supported: boolean;
    ok?: boolean;
    storedFingerprintHash?: string;
    liveFingerprintHash?: string;
    sealedContractSealHash?: string;
    lastCheckedAtMs?: number;   // excluded from hash input
    driftCode?: string;         
  };

  violations: {
    supported: boolean;
    totalsBySeverity: { INFO: number; WARN: number; CRITICAL: number };
    lastViolation?: {
      id: string;
      code: string;
      severity: "INFO" | "WARN" | "CRITICAL";
      createdAtMs: number;
      communityId?: string;
      fingerprint?: string;     
    };
    indexSize: number;
  };

  hashes: {
    inputHash: string;          // hash of canonicalized inputs used
    outputHash: string;         // hash of canonicalized artifact (minus timestamps)
    engineVersion: string;      
  };

  notes?: string[];             
};
