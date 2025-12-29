import { Season1ActivationContract } from "./types";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

export const contractSealer = {
  async seal(args: {
    seasonId: string;
    contract: Season1ActivationContract;
    decisionHash: string;
    constraintsHash: string;
    resolutionOutputHash: string;
  }) {
    const { seasonId, contract, decisionHash, constraintsHash, resolutionOutputHash } = args;

    const sealPayload = {
      seasonId,
      contractHash: contract.activationHash,
      decisionHash,
      constraintsHash,
      resolutionOutputHash
    };

    const sealHash = await sha256Hex(canonicalJson(sealPayload));

    const sealedContract: Season1ActivationContract = {
      ...contract,
      sealed: true,
      // Metadata fields excluded from sealHash input
      // @ts-ignore (extending base type with seal metadata)
      sealedAtMs: Date.now(),
      sealedBy: "SYSTEM_ORCHESTRATOR",
      sealHash,
      sealedContractHash: "" 
    };

    const { sealedContractHash: _, ...hashable } = sealedContract as any;
    (sealedContract as any).sealedContractHash = await sha256Hex(canonicalJson(hashable));

    return {
      sealedContract,
      sealHash,
      sealedContractHash: (sealedContract as any).sealedContractHash
    };
  }
};