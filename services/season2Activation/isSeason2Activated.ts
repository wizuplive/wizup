import { localStorageSinks } from "./persistence/localStorageSinks";

/**
 * 🔒 SEASON 2 ACTIVATION ENFORCEMENT
 * Returns true only if a valid, cross-checked ACTIVATED receipt exists.
 */
export async function isSeason2Activated(seasonId: string): Promise<boolean> {
  try {
    const receipt = localStorageSinks.readReceipt(seasonId);
    if (!receipt || receipt.decision !== "ACTIVATED") return false;

    const sealed = localStorageSinks.readSealedContract(seasonId);
    if (!sealed) return false;

    // Cross-check: Receipt must point to the sealed contract's identity
    if (receipt.sealedContractSealHash !== sealed.hashes.sealHash) return false;

    return true;
  } catch {
    return false; // fail-closed
  }
}
