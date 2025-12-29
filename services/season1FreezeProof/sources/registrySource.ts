import { sha256Hex, canonicalJson } from "../../zaps/season0/hash";
import { CALIBRATION_v1_1 } from "../../seasonalSimulation/calibration";

/**
 * 🏺 REGISTRY SOURCE
 * Computes the authoritative fingerprint of the Season 1 protocol state.
 */
export const registrySource = {
  async computeImmutableFingerprint(args: {
    seasonId: string;
    contractHash: string;
    receiptHash: string;
    constraintsHash: string;
  }): Promise<string> {
    const configHash = await sha256Hex(canonicalJson(CALIBRATION_v1_1));
    
    const payload = {
      seasonId: args.seasonId,
      contractHash: args.contractHash,
      receiptHash: args.receiptHash,
      constraintsHash: args.constraintsHash,
      configHash,
      registryVersion: "v1"
    };

    return await sha256Hex(canonicalJson(payload));
  }
};
