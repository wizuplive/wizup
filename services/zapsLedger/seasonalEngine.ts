import { recognitionLedger } from "./recognitionLedger";
import { RecognitionArtifact, RecognitionSignal } from "./types";
import { CALIBRATION_v1_1 } from "../seasonalSimulation/calibration";
import { caps } from "../seasonalSimulation/caps";
import { seasonGatekeeper } from "../seasonalGovernance/seasonGatekeeper";
import { requireSeason1ActivatedOrNoop } from "../season1Runtime/season1Gate";
import { requireSeason2ActivatedOrNoop } from "../season2Gate/season2Gate";
import { computeOrVerifySeason2FreezeProof } from "../season2FreezeProof/season2FreezeProof";
import { proofSinks } from "../season2TemporalLock/persistence/proofSinks";
import { verifySeason2RuntimeOrLatch } from "../season2Integrity/season2RuntimeTripwire";
import { localStorageSinks } from "../season2Activation/persistence/localStorageSinks";
import { protocolIntegrityGuard } from "../protocolBoundary/guards/protocolIntegrityGuard";

/**
 * 🏛️ SEASONAL RESOLUTION ENGINE
 * =============================
 * Purpose: Resolve Recognition outcomes from observed Energy use.
 */

export const seasonalEngine = {

  async resolveCommunity(communityId: string, seasonId: string): Promise<RecognitionArtifact[]> {
    // --- 🛡️ PROTOCOL INTEGRITY GUARD ---
    const integrity = await protocolIntegrityGuard.requireProtocolIntegrityOrNoop(seasonId);
    if (!integrity.ok) {
       return [{ 
         userId: "BOUNDARY_INTEGRITY_FAIL", 
         communityId: "NOOP", 
         seasonId, 
         units: 0, rank: 0, percentile: 0, sealedAt: 0, 
         isNoop: true 
       }];
    }

    const isS2 = seasonId === "S2" || seasonId.startsWith("S2_");

    // --- 🔒 SEASON 1 ACTIVATION GATE ---
    const gate1 = await requireSeason1ActivatedOrNoop<RecognitionArtifact[]>({ 
      seasonId, 
      context: "resolveCommunity" 
    });
    if (gate1.ok === false) {
      return gate1.noop;
    }

    // --- 🔒 SEASON 2 ACTIVATION & FREEZE GATE ---
    if (isS2) {
      // 1. Activation Gate
      const gate2 = await requireSeason2ActivatedOrNoop<RecognitionArtifact[]>({
        seasonId,
        noop: [{ 
          userId: "GATE_BLOCK_SENTINEL_S2", 
          communityId: "NOOP", 
          seasonId,
          units: 0,
          rank: 0,
          percentile: 0,
          sealedAt: 0,
          isNoop: true 
        }],
        reasonCode: "resolveCommunity"
      });
      if (gate2.allowed === false) return gate2.noop;

      // 2. Latch Gate
      if (proofSinks.readNoopLatch(seasonId)) {
        return [{ userId: "LATCH_BLOCK_S2", communityId: "NOOP", seasonId, units: 0, rank: 0, percentile: 0, sealedAt: 0, isNoop: true }];
      }

      // 3. Runtime Integrity Tripwire (Spec v6)
      const receipt = localStorageSinks.readReceipt(seasonId);
      if (receipt) {
        const tripwire = await verifySeason2RuntimeOrLatch({
          seasonId,
          sealedContractSealHash: receipt.sealedContractSealHash,
          context: { entryPoint: "resolveCommunity", communityId }
        });
        if (!tripwire.ok) {
          return [{ userId: "INTEGRITY_BLOCK_S2", communityId: "NOOP", seasonId, units: 0, rank: 0, percentile: 0, sealedAt: 0, isNoop: true }];
        }
      }

      // 4. Freeze Gate
      const freezeRes = await computeOrVerifySeason2FreezeProof({ seasonId, nowMs: Date.now() });
      if (!freezeRes.ok) {
        return [{ userId: "DRIFT_BLOCK_S2", communityId: "NOOP", seasonId, units: 0, rank: 0, percentile: 0, sealedAt: 0, isNoop: true }];
      }
    }

    const isSeason1 = seasonId === "S1" || seasonId === "SEASON_1";

    // --- SEASON GATE ENFORCEMENT ---
    if (isSeason1) {
        const result = await seasonGatekeeper.assertSeasonAllowed({ seasonId: "S1" });
        if (result.constraints?.overrides.exclusions?.communities?.includes(communityId)) {
            console.log(`%c[ENGINE] Community ${communityId} excluded by moral constraint.`, "color: #999;");
            return [];
        }
    }

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const signals = recognitionLedger.getSignals(communityId, { start: thirtyDaysAgo, end: now });
    const userMassMap = new Map<string, number>();

    // 1. Aggregate raw signal mass per user
    signals.forEach(s => {
      const current = userMassMap.get(s.userId) || 0;
      userMassMap.set(s.userId, current + s.energyMass);
    });

    // 2. Apply Normalization
    const normalizedUserUnits = new Map<string, number>();
    userMassMap.forEach((mass, userId) => {
      const units = mass > 0 ? 1 + Math.log10(mass) : 0;
      normalizedUserUnits.set(userId, units);
    });

    const communityTotalUnitsRaw = Array.from(normalizedUserUnits.values()).reduce((a, b) => a + b, 0);

    // 3. Apply Anti-Whale Clamps
    const artifacts: RecognitionArtifact[] = [];
    normalizedUserUnits.forEach((units, userId) => {
      const clampedUnits = caps.applyWhaleClamp(units, communityTotalUnitsRaw);
      
      artifacts.push({
        userId,
        communityId,
        seasonId,
        units: Number(clampedUnits.toFixed(4)),
        rank: 0, 
        percentile: 0,
        sealedAt: Date.now()
      });
    });

    // 4. Resolve Ranks
    artifacts.sort((a, b) => b.units - a.units).forEach((a, i) => {
      a.rank = i + 1;
      a.percentile = Number(((1 - i / artifacts.length) * 100).toFixed(2));
    });

    this.sealArtifacts(communityId, seasonId, artifacts);
    return artifacts;
  },

  sealArtifacts(communityId: string, seasonId: string, artifacts: RecognitionArtifact[]) {
    const key = `wizup:recognition:artifacts:${communityId}:${seasonId}`;
    localStorage.setItem(key, JSON.stringify(artifacts));
    console.log(`%c[ENGINE] Season ${seasonId} Resolved for ${communityId}. ${artifacts.length} artifacts sealed.`, "color: #22c55e; font-weight: bold;");
  }
};
