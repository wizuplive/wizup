import { zapsSignalLogService } from "../zapsSignals/zapsSignalLogService";
import { CALIBRATION_v1_1 } from "../seasonalSimulation/calibration";
import { caps } from "../seasonalSimulation/caps";
import { CommunityTreasuryLedger, TreasuryUnits } from "./types";

/**
 * 📊 COMMUNITY TREASURY AGGREGATION SERVICE
 * =========================================
 * Responsibilities: 
 * 1. Gather all community signals.
 * 2. Group by user to apply per-user caps.
 * 3. Sum into thematic units (Participation, Civic, etc).
 * 4. Apply whale clamps (Max 15% per user contribution).
 */

export const communityTreasuryAggregationService = {

  async generateLedger(communityId: string, seasonId: string, window: { startAt: number; endAt: number }): Promise<CommunityTreasuryLedger> {
    const allSignals = zapsSignalLogService.listByCommunity(communityId)
      .filter(s => s.ts >= window.startAt && s.ts <= window.endAt);

    const userMap = new Map<string, { units: TreasuryUnits; total: number }>();
    
    // 1. Accumulate raw units per user per category
    allSignals.forEach(signal => {
      const userId = signal.actorUserId;
      if (!userMap.has(userId)) {
        userMap.set(userId, { 
          units: { joinToEarn: 0, participation: 0, moderation: 0, governance: 0 },
          total: 0 
        });
      }
      
      const userData = userMap.get(userId)!;
      const weight = (CALIBRATION_v1_1.weights as any)[signal.type] || 1.0;

      if (signal.type === 'COMMUNITY_JOIN') {
        userData.units.joinToEarn += weight;
      } else if (['UPVOTE', 'DOWNVOTE', 'COMMENT', 'UPVOTE_RECEIVED', 'COMMENT_CREATED', 'COMMENT_UPVOTED'].includes(signal.type)) {
        userData.units.participation += weight;
      } else if (signal.type === 'MODERATION_ACTION') {
        userData.units.moderation += weight;
      } else if (['GOVERNANCE_VOTE', 'GOVERNANCE_PROPOSAL'].includes(signal.type)) {
        userData.units.governance += weight;
      }
      
      userData.total += weight;
    });

    // 2. Apply Per-User Caps (Simulation Invariant: Max 100 units per user contributes to Treasury weight)
    const cappedUserTotals: Record<string, number> = {};
    userMap.forEach((data, userId) => {
      cappedUserTotals[userId] = caps.applySoftCap(data.total, 100);
    });

    const communityTotalUnitsRaw = Object.values(cappedUserTotals).reduce((a, b) => a + b, 0);
    
    // 3. Final Aggregation into Global Sources (with Whale Clamping)
    const finalSources: TreasuryUnits = { joinToEarn: 0, participation: 0, moderation: 0, governance: 0 };
    let finalTotalUnits = 0;

    userMap.forEach((data, userId) => {
      const cappedTotal = cappedUserTotals[userId];
      // Apply Whale Clamp: If user > 15% of community raw mass, clamp their contribution to the treasury
      const clampedUserWeight = caps.applyWhaleClamp(cappedTotal, communityTotalUnitsRaw);
      
      // Calculate scalar to adjust category breakdown proportionally to the clamp
      const scalar = data.total > 0 ? clampedUserWeight / data.total : 0;

      finalSources.joinToEarn += data.units.joinToEarn * scalar;
      finalSources.participation += data.units.participation * scalar;
      finalSources.moderation += data.units.moderation * scalar;
      finalSources.governance += data.units.governance * scalar;
      finalTotalUnits += clampedUserWeight;
    });

    return {
      communityId,
      seasonId,
      sources: {
        joinToEarn: Number(finalSources.joinToEarn.toFixed(2)),
        participation: Number(finalSources.participation.toFixed(2)),
        moderation: Number(finalSources.moderation.toFixed(2)),
        governance: Number(finalSources.governance.toFixed(2))
      },
      totalUnits: Number(finalTotalUnits.toFixed(2)),
      userContributionCount: userMap.size,
      constraints: {
        perUserCapApplied: true,
        whaleClampApplied: true,
        rateLimitApplied: true
      },
      createdAt: Date.now()
    };
  }
};
