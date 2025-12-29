
import { Season1ActivationContract } from "./types";
import { season1LockService } from "./season1LockService";
import { season1StateMachine } from "./season1StateMachine";
import { season1ArtifactService } from "./season1Artifact";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 📜 SEASON 1 ACTIVATION CONTRACT
 * ===============================
 */
export const season1ContractService = {
  async armSeason1(durationDays: number): Promise<Season1ActivationContract> {
    if (season1StateMachine.getState() !== "DORMANT") {
      throw new Error("ARM_DENIED: Season 1 is already in progress.");
    }

    const frozenInputs = await season1LockService.computeContractHashes();
    const now = Date.now();
    
    // Window starts in 1 hour by default to allow propagation
    const startMs = now + (3600 * 1000); 
    const endMs = startMs + (durationDays * 24 * 3600 * 1000);

    const partialContract: Omit<Season1ActivationContract, "activationHash"> = {
      seasonId: "S1",
      timeWindow: { startMs, endMs },
      frozenInputs,
      invariants: {
        noRuleChanges: true,
        noManualOverrides: true,
        noEarlyTermination: true,
        noPostHocEdits: true
      },
      createdAtMs: now,
      signedBy: "SYSTEM_ARCHITECT"
    };

    const activationHash = await sha256Hex(canonicalJson(partialContract));

    const contract: Season1ActivationContract = {
      ...partialContract,
      activationHash
    };

    season1ArtifactService.save("CONTRACT", contract);
    season1StateMachine.transitionTo("ARMED");

    return contract;
  }
};
