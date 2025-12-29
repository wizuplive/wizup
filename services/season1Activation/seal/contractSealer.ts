import { canonicalJson, sha256Hex } from "../hash";

/**
 * 🖋️ CONTRACT SEALER
 */
export async function sealActivationContract(args: {
  seasonId: string;

  // hashes that must be chained into the seal
  unsealedContractHash: string;
  readinessDecisionHash: string;
  readinessInputHash?: string | null;
  constraintsHash: string;
  resolutionArtifactHash: string;

  runnerVersion?: string;
}) {
  const payload = {
    seasonId: args.seasonId,
    unsealedContractHash: args.unsealedContractHash,
    readinessDecisionHash: args.readinessDecisionHash,
    readinessInputHash: args.readinessInputHash ?? null,
    constraintsHash: args.constraintsHash,
    resolutionArtifactHash: args.resolutionArtifactHash,
    runnerVersion: args.runnerVersion ?? "contractSealer@v1",
  };

  const sealedContractHash = await sha256Hex(canonicalJson(payload));
  return { sealedContractHash, sealPayloadForAudit: payload };
}
