
import { sha256Hex, canonicalJson } from "../../zaps/season0/hash";
import { ResolutionInputs, AllocationEntry } from "./types";

/**
 * 🔒 DETERMINISTIC RESOLUTION HASHING
 * ====================================
 */

export async function hashResolutionInputs(inputs: ResolutionInputs): Promise<string> {
  // Only hash essential identifying data
  const identifiableInputs = {
    signalCount: inputs.signals.length,
    treasuryIds: Object.keys(inputs.treasuries).sort(),
    timestamp: inputs.timestamp
  };
  return await sha256Hex(canonicalJson(identifiableInputs));
}

export async function hashResolutionOutputs(allocations: AllocationEntry[]): Promise<string> {
  // Sort allocations to ensure deterministic hash
  const sorted = [...allocations].sort((a, b) => {
    const comm = a.communityId.localeCompare(b.communityId);
    if (comm !== 0) return comm;
    return a.userId.localeCompare(b.userId);
  });
  return await sha256Hex(canonicalJson(sorted));
}
