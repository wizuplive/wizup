import { CompiledConstraintSink } from "./sink";
import { CompiledSeasonConstraints } from "../types";
import { season1TemporalLock } from "../../../season1TemporalLock/season1TemporalLock";
import { season1FreezeProof } from "../../../season1FreezeProof/season1FreezeProof";
import { seasonFinalizedGate } from "../../../seasonEnd/seasonFinalizedGate";

const STORAGE_KEY_PREFIX = "WIZUP::GOV::CONSTRAINTS::v1::";

export class LocalStorageConstraintSink implements CompiledConstraintSink {
  async write(artifact: CompiledSeasonConstraints): Promise<void> {
    // --- 🏁 SEASON FINALIZED GUARD ---
    const finalizedRes = await seasonFinalizedGate.requireSeasonNotFinalizedOrNoop(artifact.seasonId, "constraintsWrite");
    if (!finalizedRes.allowed) return;

    // --- ❄️ CRITICAL FREEZE GUARD ---
    const freezeRes = await season1FreezeProof.assertSeason1NotFrozenOrNoop(artifact.seasonId);
    if (!freezeRes.allowed) return;

    // --- 🔒 TEMPORAL LOCK ENFORCEMENT ---
    const lockRes = await season1TemporalLock.enforceSeason1WritePolicy({
      seasonId: artifact.seasonId,
      objectType: "compiledConstraints",
      proposedHash: artifact.hashes.compiledHash,
      existingHashLoader: async () => {
        const existing = await this.read(artifact.seasonId);
        return existing?.hashes.compiledHash || null;
      }
    });

    if (!lockRes.allowed) return;

    const key = `${STORAGE_KEY_PREFIX}${artifact.seasonId}`;
    if (localStorage.getItem(key)) {
      console.warn(`[COMPILER] Refusing override for existing constraints: ${artifact.seasonId}`);
      return;
    }
    localStorage.setItem(key, JSON.stringify(artifact));
  }

  async read(seasonId: string): Promise<CompiledSeasonConstraints | null> {
    const key = `${STORAGE_KEY_PREFIX}${seasonId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

export const defaultConstraintSink = new LocalStorageConstraintSink();
