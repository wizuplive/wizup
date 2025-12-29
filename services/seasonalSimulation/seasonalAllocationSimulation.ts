
import { zapsSignalLogService } from "../zapsSignals/zapsSignalLogService";
import { seasonalAllocationResolutionService } from "./seasonalAllocationResolutionService";
import { SeasonAllocationPreview } from "./types";

const SIM_KEY = "wizup:season_sim:v1";

export const seasonalAllocationSimulation = {
  /**
   * Recomputes the entire season preview using the V1 Engine.
   */
  async recomputeSeason(seasonId: string): Promise<SeasonAllocationPreview> {
    // Current demo assumes season is the last 30 days
    const window = {
      startAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
      endAt: Date.now()
    };

    const preview = await seasonalAllocationResolutionService.resolveSeasonPreview(seasonId, window);

    // Persist for instrumentation (Simulation only)
    try {
      localStorage.setItem(SIM_KEY, JSON.stringify(preview));
    } catch {}

    return preview;
  },

  // Add missing recomputeCommunity method to fix "Property 'recomputeCommunity' does not exist" errors.
  async recomputeCommunity(communityId: string) {
     return this.recomputeSeason("active-season");
  },

  getLatestPreview(): SeasonAllocationPreview | null {
    try {
      const raw = localStorage.getItem(SIM_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  __reset() {
    try {
      localStorage.removeItem(SIM_KEY);
    } catch {}
  },
};
