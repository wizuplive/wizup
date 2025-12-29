import { seasonalAllocationSimulation } from "../../seasonalSimulation/seasonalAllocationSimulation";
import { SeasonAllocationPreview } from "../../seasonalSimulation/types";

export const simulationSource = {
  /**
   * Reads simulation artifacts for season-level context.
   */
  async getSimulationState(communityId: string): Promise<SeasonAllocationPreview | null> {
    try {
      // communityId is ignored in the current simulation engine's global preview structure,
      // but we return the latest preview which contains per-community data.
      return seasonalAllocationSimulation.getLatestPreview();
    } catch (e) {
      return null;
    }
  }
};
