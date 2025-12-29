
import { ConstraintAwareResolutionArtifact } from "../seasonalResolution/constraintAware/types";
import { CompiledSeasonConstraints } from "../seasonalGovernance/constraintCompiler/types";
import { Season0LegitimacyVerdict } from "../zaps/season0/verdict/types";

/**
 * 🔐 ATTESTATION LAYER — TYPES
 * ============================
 */

export interface Season1AttestationBundle {
  seasonId: string; // "S1"

  artifacts: {
    allocationArtifact: ConstraintAwareResolutionArtifact;
    compiledConstraints: CompiledSeasonConstraints;
    moralVerdict: Season0LegitimacyVerdict;
  };

  hashes: {
    moralVerdictHash: string;
    constraintsHash: string;
    allocationInputHash: string;
    allocationOutputHash: string;
    bundleContentHash: string;
  };

  signatures: {
    systemSignature: string; // Hex encoded ECDSA signature
    signedAtMs: number;
    keyId: string;
    algorithm: "ECDSA-P256-SHA256";
  };

  schemaVersion: "v1";
}

export interface VerificationResult {
  status: "VALID" | "INVALID";
  errors: string[];
  metadata?: {
    verifiedAt: number;
    signerKeyId: string;
  };
}
