
import { SeasonGateState, GateCondition } from "./types";
import { defaultGateSink } from "./persistence/localStorageGateSink";
import { defaultConstraintSink } from "./constraintCompiler/sinks/localStorageSink";
import { CompiledSeasonConstraints } from "./constraintCompiler/types";

/**
 * 🛡️ SEASON GATEKEEPER
 * ====================
 */
export const seasonGatekeeper = {
  async assertSeasonAllowed(args: {
    seasonId: string;
  }): Promise<{ gate: SeasonGateState; constraints: CompiledSeasonConstraints | null }> {
    const gate = await defaultGateSink.read(args.seasonId);

    if (!gate) {
      throw new Error("SEASON_NOT_AUTHORIZED: No gate found for execution.");
    }

    if (gate.verdict === "BLOCK") {
      throw new Error("SEASON_BLOCKED: Conscience layer denied execution.");
    }

    let constraints: CompiledSeasonConstraints | null = null;

    if (gate.verdict === "CONDITIONAL") {
      constraints = await defaultConstraintSink.read(args.seasonId);
      if (!constraints) {
        throw new Error("SEASON_CONSTRAINTS_MISSING: Gate is CONDITIONAL but no compiled artifact found.");
      }
    }

    return { gate, constraints };
  }
};
