
import { CompiledSeasonConstraints } from "./types";
import { sha256Hex, canonicalJson } from "../../zaps/season0/hash";

/**
 * 🔒 DETERMINISTIC CONSTRAINT HASHING
 * =====================================
 */
export async function hashCompiledConstraints(
  value: Omit<CompiledSeasonConstraints, "hashes">,
  gateHash: string
): Promise<string> {
  const hashInput = {
    seasonId: value.seasonId,
    overrides: value.overrides,
    gateHash,
    schemaVersion: value.schemaVersion
  };
  
  return await sha256Hex(canonicalJson(hashInput));
}
