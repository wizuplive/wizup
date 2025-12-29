
import { Season1AttestationBundle, VerificationResult } from "./types";
import { canonicalize } from "./canonicalize";
import { sha256Hex } from "../zaps/season0/hash";

/**
 * 🔍 TRUSTLESS BUNDLE VERIFIER
 * ============================
 */

export async function verifySeason1Bundle(
  bundle: Season1AttestationBundle,
  publicKey: CryptoKey
): Promise<VerificationResult> {
  const errors: string[] = [];

  try {
    // 1. Verify Digital Signature
    const { signatures, ...contentToVerify } = bundle;
    const data = new TextEncoder().encode(canonicalize(contentToVerify));
    
    // Decode Hex signature
    const sigBytes = new Uint8Array(
      signatures.systemSignature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const isSignatureValid = await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      publicKey,
      sigBytes,
      data
    );

    if (!isSignatureValid) {
      errors.push("CRYPTO_ERROR: Digital signature is invalid.");
    }

    // 2. Verify Hash Chain Integrity
    const moralHash = bundle.artifacts.moralVerdict.hashes.verdictHash;
    const constraintHash = bundle.artifacts.compiledConstraints.hashes.compiledHash;
    const constraintParentHash = bundle.artifacts.compiledConstraints.hashes.gateHash;
    const allocationConstraintRef = bundle.artifacts.allocationArtifact.hashes.constraintHash;
    const allocationOutputHash = bundle.artifacts.allocationArtifact.hashes.outputHash;

    if (constraintParentHash !== moralHash) {
      errors.push("HASH_CHAIN_BREAK: Constraints do not match Moral Verdict.");
    }

    if (allocationConstraintRef !== constraintHash) {
      errors.push("HASH_CHAIN_BREAK: Allocation does not match Compiled Constraints.");
    }

    // 3. Verify Deterministic Reproduction
    const partialBundleForHash = {
        seasonId: bundle.seasonId,
        artifacts: bundle.artifacts,
        schemaVersion: bundle.schemaVersion
    };
    const recomputedBundleHash = await sha256Hex(canonicalize(partialBundleForHash));
    
    if (recomputedBundleHash !== bundle.hashes.bundleContentHash) {
       errors.push("HASH_ERROR: Bundle content hash mismatch.");
    }

    // 4. Verify Explicit Compliance Status
    if (bundle.artifacts.allocationArtifact.verdict !== "COMPLIANT") {
      errors.push("COMPLIANCE_ERROR: Contained allocation is not marked as compliant.");
    }

  } catch (e: any) {
    errors.push(`VERIFICATION_ABORTED: Internal error during audit: ${e.message}`);
  }

  return {
    status: errors.length === 0 ? "VALID" : "INVALID",
    errors,
    metadata: {
      verifiedAt: Date.now(),
      signerKeyId: bundle.signatures.keyId
    }
  };
}
