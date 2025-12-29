import { Season1ActivationContract } from "./types";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { CALIBRATION_v1_1 } from "../seasonalSimulation/calibration";
import { TREASURY_RULESET_V1 } from "../zapsTreasury/ruleset";
import { defaultGateSink } from "../seasonalGovernance/persistence/localStorageGateSink";
import { defaultConstraintSink } from "../seasonalGovernance/constraintCompiler/sinks/localStorageSink";

export const season1LockService = {
  async computeContractHashes(): Promise<Season1ActivationContract["frozenInputs"]> {
    const verdict = await defaultGateSink.read("S1");
    const constraints = await defaultConstraintSink.read("S1");

    if (!verdict || !constraints) {
      throw new Error("LOCK_FAILED: Missing prerequisite artifacts (Verdict or Constraints).");
    }

    return {
      // fix: Corrected property access from 'verdictHash' to 'conscienceHash' to align with SeasonGateState definition
      legitimacyVerdictHash: verdict.hashes.conscienceHash,
      compiledConstraintsHash: constraints.hashes.compiledHash,
      resolutionEngineHash: await sha256Hex(canonicalJson(CALIBRATION_v1_1)),
      treasuryRulesetHash: await sha256Hex(canonicalJson(TREASURY_RULESET_V1)),
      spendIntentsHash: await sha256Hex("SPEND_INTENT_V1_FROZEN")
    };
  },

  async verifyIntegrity(contract: Season1ActivationContract): Promise<boolean> {
    const current = await this.computeContractHashes();
    return canonicalJson(current) === canonicalJson(contract.frozenInputs);
  }
};