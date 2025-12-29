import { archivalPersistence } from "./persistence";
import { season1TemporalLock } from "../season1TemporalLock/season1TemporalLock";

/**
 * 🔒 SEASON FINALIZED GATE
 * Provides a hard lock on Season 1 once finalization is complete.
 */
export const seasonFinalizedGate = {
  // Added async and await to fix property access on Promise
  async isSeasonFinalized(seasonId: string): Promise<boolean> {
    const receipt = await archivalPersistence.getReceipt(seasonId);
    return receipt?.status === "FINALIZED";
  },

  async requireSeasonNotFinalizedOrNoop(seasonId: string, context: string): Promise<{ allowed: boolean }> {
    // Added await for async isSeasonFinalized
    const finalized = await this.isSeasonFinalized(seasonId);
    if (finalized) {
      await season1TemporalLock.emitViolation(
        "POST_SEASON_MUTATION_ATTEMPT",
        "CRITICAL",
        { seasonId, objectType: "unknown" },
        { details: { context } }
      );
      return { allowed: false };
    }
    return { allowed: true };
  }
};