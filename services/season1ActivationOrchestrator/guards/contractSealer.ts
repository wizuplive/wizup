/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { Season1ActivationContract } from "../../season1Activation/types";
import { sha256Hex, canonicalJson } from "../../zaps/season0/hash";

export const contractSealer = {
  async seal(
    contract: Season1ActivationContract,
    readinessHash: string,
    constraintsHash: string,
    resolutionArtifactHash: string,
    runnerVersion: string
  ): Promise<{ sealedContract: Season1ActivationContract; sealHash: string }> {
    
    // We explicitly exclude existing seal-related fields if any were present
    const { activationHash, ...baseContract } = contract as any;

    const sealPayload = {
      seasonId: contract.seasonId,
      contractBaseHash: activationHash, // Fingerprint of the unsealed state
      readinessHash,
      constraintsHash,
      resolutionArtifactHash,
      runnerVersion,
    };

    const sealHash = await sha256Hex(canonicalJson(sealPayload));

    const sealedContract: Season1ActivationContract = {
      ...contract,
      activationHash: sealHash, // The seal becomes the authority
      invariants: {
        ...contract.invariants,
        noRuleChanges: true, // Re-assert in sealed state
      }
    };

    // Metadata for diagnostics
    (sealedContract as any).sealed = true;
    (sealedContract as any).sealedAtMs = Date.now();
    (sealedContract as any).sealHash = sealHash;

    return { sealedContract, sealHash };
  }
};
