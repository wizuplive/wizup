import { communityTreasuryAggregationService } from "../communityTreasury/aggregationService";
import { CommunityTreasuryLedger } from "../communityTreasury/types";
import { zapsSignalLogService } from "../zapsSignals/zapsSignalLogService";
import { seasonGatekeeper } from "../seasonalGovernance/seasonGatekeeper";
import { requireSeason1Activated } from "../season1ActivationOrchestrator/runtimeGate";
import { makeNoopMeta } from "../season1ActivationOrchestrator/types/gatedNoop";

/**
 * 🏛️ COMMUNITY TREASURY RESOLVER
 * ==============================
 * Purely functional service to resolve all treasuries for a season snapshot.
 * Respects moral gate constraints for Season 1+.
 */

export const communityTreasuryResolver = {
  async resolveAll(seasonId: string, window: { startAt: number; endAt: number }): Promise<Record<string, CommunityTreasuryLedger>> {
    const isSeason1 = seasonId === "S1" || seasonId === "SEASON_1";

    // --- ACTIVATION GATE ---
    if (isSeason1) {
      const gate = await requireSeason1Activated(seasonId);
      // fix: Use explicit comparison to allow TypeScript narrowing of the discriminated union
      if (gate.allowed === false) {
        console.log(`%c[TREASURY] Season 1 treasury resolution gated: ${gate.reason}`, "color: #999;");
        return {};
      }
    }

    let excludedCommunities: string[] = [];

    // --- SEASON GATE ENFORCEMENT ---
    if (isSeason1) {
      try {
        const result = await seasonGatekeeper.assertSeasonAllowed({ seasonId: "S1" });
        excludedCommunities = result.constraints?.overrides.exclusions?.communities || [];
      } catch (e) {
        console.warn("[TreasuryResolver] Gate check failed. Blocking resolution.", e);
        return {};
      }
    }

    const allSignals = zapsSignalLogService.listAll();
    const communityIds = Array.from(new Set(allSignals.map(s => s.communityId)))
      .filter(cid => !excludedCommunities.includes(cid));
    
    const results: Record<string, CommunityTreasuryLedger> = {};

    for (const cid of communityIds) {
      const ledger = await communityTreasuryAggregationService.generateLedger(cid, seasonId, window);
      results[cid] = {
        ...ledger,
        sealedAt: Date.now()
      };
    }

    return results;
  }
};