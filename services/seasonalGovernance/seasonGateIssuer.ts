
import { SeasonGateState, MoralVerdict, GateCondition } from "./types";
import { Season0LegitimacyVerdict } from "../zaps/season0/verdict/types";
import { defaultGateSink } from "./persistence/localStorageGateSink";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 🏛️ SEASON GATE ISSUER
 * =====================
 */
export const seasonGateIssuer = {
  async issueSeasonGate(args: {
    seasonId: string;
    priorSeasonId: string;
    verdict: MoralVerdict;
    conscienceArtifact: Season0LegitimacyVerdict;
    conditions?: GateCondition[];
  }): Promise<SeasonGateState> {
    const conscienceHash = args.conscienceArtifact.hashes.verdictHash;

    const state: Omit<SeasonGateState, "hashes"> = {
      seasonId: args.seasonId,
      priorSeasonId: args.priorSeasonId,
      verdict: args.verdict,
      issuedAtMs: Date.now(),
      issuedBy: "SYSTEM_CONSCIENCE",
      conditions: args.conditions,
      irreversible: true
    };

    const gateStateHash = await sha256Hex(canonicalJson(state));

    const finalState: SeasonGateState = {
      ...state,
      hashes: {
        conscienceHash,
        gateStateHash
      }
    };

    await defaultGateSink.write(finalState);
    return finalState;
  }
};
