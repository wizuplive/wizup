/**
 * 🔒 SEASON 2 RUNTIME INTEGRITY TYPES
 * ===================================
 */

export type RuntimeFingerprintV1 = {
  schemaVersion: "v1";
  seasonId: string; 
  sealedContractSealHash: string; // anchor to the S2 sealed contract
  createdAtMs: number; 

  build: {
    buildTag: string;        
    appVersion?: string;     
    runtimeEnv: "dev" | "prod";
  };

  versions: {
    constraintAwareEngineVersion: string;
    constraintCompilerVersion: string;
    moralGateVersion?: string;
    canonBundleSchemaVersion: string;
    violationSchemaVersion: string;
    season2GateVersion: string;          
    season2TemporalLockVersion: string;
    canonFreezeProofVersion: string;
  };

  hashes: {
    sealedContractHash: string;   
    constraintsHash: string;      
    configHash: string;           
    engineBundleHash: string;     
    fingerprintHash: string;      
  };
};

export type NoopLatchV1 = {
  schemaVersion: "v1";
  seasonId: string;
  triggeredAtMs: number; 
  reason: "CRITICAL_RUNTIME_DRIFT" | "CRITICAL_FREEZE_PROOF_DRIFT" | "MANUAL_LATCH";
  fingerprintHashAtTrigger?: string;
  sealedContractSealHash: string;
  hash: string; 
};

export type TripwireResult =
  | { ok: true; fingerprintHash: string }
  | { ok: false; code: "NO_SEASON_ID" | "NOOP_LATCHED" | "FINGERPRINT_MISSING" | "HASH_MISMATCH" | "CONTRACT_SEAL_MISMATCH" | "VERIFIER_ERROR" };

export type IntegrityViolationCode = "CRITICAL_RUNTIME_DRIFT";
