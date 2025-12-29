
import { season1StateMachine } from "./season1StateMachine";
import { season1ArtifactService } from "./season1Artifact";
import { Season1ActivationContract } from "./types";
import { seasonalAllocationResolutionService } from "../seasonalSimulation/seasonalAllocationResolutionService";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 🏛️ SEASON 1 FINALIZER
 * =====================
 */
export const season1Finalizer = {
  async finalize(): Promise<void> {
    const state = season1StateMachine.getState();
    if (state !== "SEALED") {
      throw new Error(`FINALIZATION_DENIED: Cannot finalize from ${state}.`);
    }

    const contract = season1ArtifactService.read("CONTRACT") as Season1ActivationContract;
    if (!contract) throw new Error("FINALIZATION_CRITICAL: Contract missing.");

    try {
      const window = {
        startAt: contract.timeWindow.startMs,
        endAt: contract.timeWindow.endMs
      };

      // Resolve formal allocation
      const preview = await seasonalAllocationResolutionService.resolveSeasonPreview("S1", window);
      const allocationHash = preview.hash;

      const finalArtifact = {
        seasonId: "S1",
        contractHash: contract.activationHash,
        allocationHash,
        finalizedAtMs: Date.now(),
        status: "FINALIZED"
      };

      season1ArtifactService.save("FINAL_ALLOCATION", finalArtifact);
      season1StateMachine.transitionTo("FINALIZED");
      
      console.log("%c[FINALIZER] Season 1 Sealed Forever.", "color: #22c55e; font-weight: bold;");

    } catch (e) {
      season1StateMachine.transitionTo("FROZEN");
      console.error("[FINALIZER] Resolution failed. System FROZEN.", e);
    }
  }
};
