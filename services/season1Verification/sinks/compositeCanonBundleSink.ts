import type { Season1CanonBundle } from "../types/canonBundleTypes";
import { appendCanonIndexEntry } from "../index/canonBundleIndex";
import { isSeason1Activated } from "../../season1Runtime/isSeason1Activated";
import { season1TemporalLock } from "../../season1TemporalLock/season1TemporalLock";
import { season1FreezeProof } from "../../season1FreezeProof/season1FreezeProof";
import { seasonFinalizedGate } from "../../seasonEnd/seasonFinalizedGate";
import { protocolWriteRouter } from "../../protocolWriteRouter/singleton";

export class CompositeCanonBundleSink {
  constructor(
    private readonly deps: {
      enableFirestoreShadow: boolean;
      enableIndexing: boolean;
    }
  ) {}

  async write(bundle: Season1CanonBundle): Promise<void> {
    // --- 🏁 SEASON FINALIZED GUARD ---
    const finalizedRes = await seasonFinalizedGate.requireSeasonNotFinalizedOrNoop(bundle.seasonId, "canonBundleWrite");
    if (!finalizedRes.allowed) return;

    // --- ❄️ CRITICAL FREEZE GUARD ---
    const freezeRes = await season1FreezeProof.assertSeason1NotFrozenOrNoop(bundle.seasonId);
    if (!freezeRes.allowed) return;

    // --- 🔒 TEMPORAL LOCK ENFORCEMENT ---
    const lockRes = await season1TemporalLock.enforceSeason1WritePolicy({
      seasonId: bundle.seasonId,
      communityId: bundle.communityId,
      objectType: "canonBundle",
      proposedHash: bundle.bundleHash,
      existingHashLoader: async () => {
        // Fallback read for lock check
        const raw = localStorage.getItem(`WIZUP::ZAPS::S1::CANON_BUNDLE::${bundle.seasonId}::${bundle.communityId}`);
        return raw ? JSON.parse(raw).bundleHash : null;
      }
    });

    if (!lockRes.allowed) return;

    // --- 🛡️ WRITE-SIDE ACTIVATION GUARD (Season 1) ---
    const isS1 = bundle.seasonId === "S1" || bundle.seasonId === "SEASON_1";
    if (isS1) {
      const activated = await isSeason1Activated("S1");
      if (!activated) {
        console.error(`[SINK_ERROR] Canon Write Refused: Season 1 not activated.`);
        return;
      }
    }

    try {
      // 1) Route Write through protocolWriteRouter (Single Choke Point)
      const res = await protocolWriteRouter().write({
          seasonId: bundle.seasonId,
          kind: "CANON_BUNDLE",
          communityId: bundle.communityId,
          docId: `${bundle.seasonId}__${bundle.communityId}`
      }, bundle);

      if (!res.local.ok) return;

      // 2) Index dev-only
      if (this.deps.enableIndexing) {
        appendCanonIndexEntry({
          seasonId: bundle.seasonId,
          communityId: bundle.communityId,
          bundleHash: bundle.bundleHash,
          writtenAtMs: Date.now(),
        });
      }
    } catch {
      // fail-open
    }
  }
}
