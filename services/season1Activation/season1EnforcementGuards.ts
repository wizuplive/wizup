
import { season1StateMachine } from "./season1StateMachine";
import { season1ArtifactService } from "./season1Artifact";
import { Season1ActivationContract } from "./types";
import { season1LockService } from "./season1LockService";

/**
 * 🛡️ SEASON 1 ENFORCEMENT GUARDS
 * ==============================
 */
export const season1EnforcementGuards = {
  async assertOperationAllowed(): Promise<void> {
    const state = season1StateMachine.getState();
    const now = Date.now();

    if (state === "DORMANT" || state === "ARMED") {
      // Check for automatic activation
      const contract = season1ArtifactService.read("CONTRACT") as Season1ActivationContract;
      if (contract && now >= contract.timeWindow.startMs) {
        season1StateMachine.transitionTo("ACTIVE");
        return;
      }
      return; // Not yet active
    }

    if (state === "ACTIVE") {
      const contract = season1ArtifactService.read("CONTRACT") as Season1ActivationContract;
      if (!contract) {
        season1StateMachine.transitionTo("FROZEN");
        throw new Error("ENFORCEMENT_CRITICAL: Contract missing in ACTIVE state.");
      }

      // Check window expiry
      if (now > contract.timeWindow.endMs) {
        season1StateMachine.transitionTo("SEALED");
        throw new Error("ENFORCEMENT_STOP: Season 1 window closed.");
      }

      // Check rule integrity
      const intact = await season1LockService.verifyIntegrity(contract);
      if (!intact) {
        season1StateMachine.transitionTo("FROZEN");
        throw new Error("ENFORCEMENT_HALT: Rule tampering detected.");
      }
    }

    if (state === "SEALED" || state === "FINALIZED" || state === "FROZEN") {
      throw new Error(`ENFORCEMENT_STOP: Season 1 is ${state}.`);
    }
  },

  isSeason1Active(): boolean {
    return season1StateMachine.getState() === "ACTIVE";
  }
};
