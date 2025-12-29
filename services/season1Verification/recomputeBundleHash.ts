import { sha256Hex, canonicalJson } from "./hash";

export async function recomputeBundleHash(args: {
  seasonId: string;
  communityId: string;
  receiptHash: string;
  constraintsHash: string;
  configHash: string;
  signalsSnapshotHash: string;
  resolutionArtifactHash: string;
}): Promise<string> {
  const input = {
    seasonId: args.seasonId,
    communityId: args.communityId,
    receiptHash: args.receiptHash,
    constraintsHash: args.constraintsHash,
    configHash: args.configHash,
    signalsSnapshotHash: args.signalsSnapshotHash,
    resolutionArtifactHash: args.resolutionArtifactHash,
    schemaVersion: "v1"
  };

  return await sha256Hex(canonicalJson(input));
}