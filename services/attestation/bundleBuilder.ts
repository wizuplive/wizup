
import { Season1AttestationBundle } from "./types";
import { ConstraintAwareResolutionArtifact } from "../seasonalResolution/constraintAware/types";
import { CompiledSeasonConstraints } from "../seasonalGovernance/constraintCompiler/types";
import { Season0LegitimacyVerdict } from "../zaps/season0/verdict/types";
import { sha256Hex } from "../zaps/season0/hash";
import { canonicalize } from "./canonicalize";

/**
 * 🏗️ ATTESTATION BUNDLE BUILDER
 * =============================
 */

export async function buildSeason1AttestationBundle(args: {
  allocationArtifact: ConstraintAwareResolutionArtifact;
  compiledConstraints: CompiledSeasonConstraints;
  moralVerdict: Season0LegitimacyVerdict;
}): Promise<Season1AttestationBundle> {
  // 1. Structural Integrity Assertions
  if (args.allocationArtifact.verdict !== "COMPLIANT") {
    throw new Error("ATTESTATION_FAILED: Allocation artifact is not marked COMPLIANT.");
  }

  if (args.moralVerdict.verdict === "BLOCK") {
    throw new Error("ATTESTATION_FAILED: Cannot attest a season blocked by moral verdict.");
  }

  if (args.compiledConstraints.hashes.gateHash !== args.moralVerdict.hashes.verdictHash) {
    throw new Error("ATTESTATION_FAILED: Constraint-to-Verdict hash mismatch.");
  }

  if (args.allocationArtifact.hashes.constraintHash !== args.compiledConstraints.hashes.compiledHash) {
    throw new Error("ATTESTATION_FAILED: Allocation-to-Constraint hash mismatch.");
  }

  // 2. Compute Internal Hash Chain
  const hashes = {
    moralVerdictHash: args.moralVerdict.hashes.verdictHash,
    constraintsHash: args.compiledConstraints.hashes.compiledHash,
    allocationInputHash: args.allocationArtifact.hashes.inputHash,
    allocationOutputHash: args.allocationArtifact.hashes.outputHash,
    bundleContentHash: "" // Calculated below
  };

  const partialBundle: Omit<Season1AttestationBundle, "signatures" | "hashes"> = {
    seasonId: args.allocationArtifact.seasonId,
    artifacts: args,
    schemaVersion: "v1"
  };

  // 3. Final Content Hash for Signing
  hashes.bundleContentHash = await sha256Hex(canonicalize(partialBundle));

  return {
    ...partialBundle,
    hashes,
    signatures: {
        systemSignature: "", // To be populated by Signing Service
        signedAtMs: 0,
        keyId: "",
        algorithm: "ECDSA-P256-SHA256"
    }
  };
}
