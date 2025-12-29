import { isSeason1Activated } from "./isSeason1Activated";

export type RuntimeGateResult<T> = 
  | { ok: true; noop?: never }
  | { ok: false; reason: "S1_NOT_ACTIVATED"; noop: T };

/**
 * 🔒 SEASON 1 AUTHORITATIVE GATE
 * ===============================
 * Ensures Season 1 logic only proceeds if an immutable activation receipt exists.
 * Returns a standardized NOOP object matching the expected return type of the caller.
 * Invariant: All NOOP objects carry isNoop: true and noop-v1 fingerprint.
 */
export async function requireSeason1ActivatedOrNoop<T>(args: { 
  seasonId: string; 
  context: "resolveSeasonWithConstraints" | "resolveCommunity" | "resolveSeasonPreview"
}): Promise<RuntimeGateResult<T>> {
  const isS1 = args.seasonId === "S1" || args.seasonId === "SEASON_1" || args.seasonId === "active-season";
  
  if (!isS1) return { ok: true };

  const activated = await isSeason1Activated("S1");
  if (activated) return { ok: true };

  // Return standardized NOOP based on caller context
  let noop: any;

  switch (args.context) {
    case "resolveSeasonWithConstraints":
      noop = {
        seasonId: args.seasonId,
        allocations: [],
        constraintProofs: { constraintHash: "NOOP", checks: [] },
        hashes: { 
          inputHash: "NOOP", 
          constraintHash: "NOOP", 
          outputHash: "NOOP", 
          engineVersion: "noop-v1" 
        },
        verdict: "COMPLIANT",
        isNoop: true // 🔒 Un-indexable invariant
      };
      break;

    case "resolveCommunity":
      // Pattern B: Return a sentinel array item to distinguish from a legitimate empty community
      noop = [{ 
        userId: "GATE_BLOCK_SENTINEL", 
        communityId: "NOOP", 
        seasonId: args.seasonId,
        units: 0,
        rank: 0,
        percentile: 0,
        sealedAt: 0,
        isNoop: true 
      }];
      break;

    case "resolveSeasonPreview":
      noop = {
        seasonId: args.seasonId,
        generatedAt: new Date().toISOString(),
        scope: "SIMULATION",
        version: "noop-v1",
        pool: [],
        resultsByCommunity: {},
        globalDiagnostics: { totalCommunities: 0, totalActiveUsers: 0 },
        hash: "NOOP_SIMULATION_BOUNDARY_HOLD",
        isNoop: true // 🔒 Un-indexable invariant
      };
      break;
  }

  return { ok: false, reason: "S1_NOT_ACTIVATED", noop: noop as T };
}
