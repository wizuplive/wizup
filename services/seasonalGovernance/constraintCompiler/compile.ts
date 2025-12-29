import { SeasonGateState, GateCondition } from "../types";
import { CompiledSeasonConstraints } from "./types";
import { validateConditions } from "./validators";
import { hashCompiledConstraints } from "./hash";
import { defaultConstraintSink } from "./sinks/localStorageSink";

/**
 * ⚙️ CONSTRAINT COMPILER
 * ======================
 */

export async function compileSeasonConstraints(args: {
  seasonId: string;
  gateState: SeasonGateState;
}): Promise<CompiledSeasonConstraints> {
  const { gateState, seasonId } = args;

  if (gateState.verdict !== "CONDITIONAL") {
    throw new Error("NO_CONDITIONS_TO_COMPILE: Gate must be CONDITIONAL.");
  }

  const conditions = gateState.conditions || [];
  validateConditions(conditions);

  // 1. Materialize Overrides
  const overrides: CompiledSeasonConstraints["overrides"] = {};

  for (const cond of conditions) {
    switch (cond.kind) {
      case "CAP_LOWERING":
        overrides.caps = { ...overrides.caps, maxShare: cond.value };
        break;
      case "DISTRIBUTION_DELAY":
        overrides.delays = { ...overrides.delays, distributionDelayMs: cond.delayMs };
        break;
      case "COMMUNITY_EXCLUSION":
        if (!overrides.exclusions) overrides.exclusions = { communities: [] };
        overrides.exclusions.communities!.push(cond.communityId);
        break;
      case "STEWARD_LIMIT":
        // fix: Corrected property access from 'cond.value' to 'cond.maxStewards'
        overrides.governance = { ...overrides.governance, maxStewards: cond.maxStewards };
        break;
      case "SIGNAL_TYPE_DISABLED":
        if (!overrides.signalFilters) overrides.signalFilters = { disabledSignalTypes: [] };
        overrides.signalFilters.disabledSignalTypes!.push(cond.signalType);
        break;
    }
  }

  // Canonicalize arrays for hashing
  if (overrides.exclusions?.communities) {
    overrides.exclusions.communities.sort();
  }
  if (overrides.signalFilters?.disabledSignalTypes) {
    overrides.signalFilters.disabledSignalTypes.sort();
  }

  // 2. Build Artifact
  const partialArtifact: Omit<CompiledSeasonConstraints, "hashes"> = {
    seasonId,
    appliedAtMs: Date.now(),
    source: "SEASON_GATE_CONDITIONAL",
    schemaVersion: "v1",
    overrides,
    irreversible: true
  };

  const compiledHash = await hashCompiledConstraints(partialArtifact, gateState.hashes.gateStateHash);

  const finalArtifact: CompiledSeasonConstraints = {
    ...partialArtifact,
    hashes: {
      gateHash: gateState.hashes.gateStateHash,
      compiledHash
    }
  };

  // 3. Persist
  await defaultConstraintSink.write(finalArtifact);

  return finalArtifact;
}
