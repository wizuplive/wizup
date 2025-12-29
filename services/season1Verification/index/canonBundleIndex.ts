import { LS_KEYS } from "../keys";
import { season1TemporalLock } from "../../season1TemporalLock/season1TemporalLock";
import { season1FreezeProof } from "../../season1FreezeProof/season1FreezeProof";

export type CanonIndexEntry = {
  seasonId: string;
  communityId: string;
  bundleHash: string;
  writtenAtMs: number;
  isNoop?: boolean; // Invariant mirror
};

const MAX_INDEX_ENTRIES = 500;

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Appends a new entry to the Canon Bundle index.
 * 🛡️ Security: Explicitly rejects any entry marked as isNoop.
 */
export async function appendCanonIndexEntry(entry: CanonIndexEntry, storage: Storage = window.localStorage) {
  if (entry.isNoop === true || entry.bundleHash === "NOOP") {
    console.log(`%c[INDEX_GUARD] Ignoring NOOP entry for ${entry.communityId}`, "color: #999;");
    return;
  }

  // --- ❄️ CRITICAL FREEZE GUARD ---
  const freezeRes = await season1FreezeProof.assertSeason1NotFrozenOrNoop(entry.seasonId);
  if (!freezeRes.allowed) return;

  // --- 🔒 TEMPORAL LOCK ENFORCEMENT ---
  const lockRes = await season1TemporalLock.enforceSeason1WritePolicy({
    seasonId: entry.seasonId,
    communityId: entry.communityId,
    objectType: "canonIndex",
    proposedHash: entry.bundleHash,
    existingHashLoader: async () => {
      const all = listCanonIndexBySeason(entry.seasonId, storage);
      const match = all.find(e => e.communityId === entry.communityId);
      return match?.bundleHash || null;
    }
  });

  if (!lockRes.allowed) return;

  try {
    const key = LS_KEYS.canonIndex();
    const existing = safeParse<CanonIndexEntry[]>(storage.getItem(key), []);

    const deduped = [
      entry,
      ...existing.filter(
        (e) => !(e.seasonId === entry.seasonId && e.communityId === entry.communityId)
      ),
    ];

    storage.setItem(key, JSON.stringify(deduped.slice(0, MAX_INDEX_ENTRIES)));
  } catch {
    // fail-open
  }
}

export function listCanonIndexBySeason(seasonId: string, storage: Storage = window.localStorage): CanonIndexEntry[] {
  try {
    const key = LS_KEYS.canonIndex();
    const all = safeParse<CanonIndexEntry[]>(storage.getItem(key), []);
    return all.filter((e) => e.seasonId === seasonId).sort((a, b) => b.writtenAtMs - a.writtenAtMs);
  } catch {
    return [];
  }
}

export function listCanonSeasons(storage: Storage = window.localStorage): string[] {
  try {
    const key = LS_KEYS.canonIndex();
    const all = safeParse<CanonIndexEntry[]>(storage.getItem(key), []);
    const set = new Set(all.map((e) => e.seasonId));
    return Array.from(set).sort();
  } catch {
    return [];
  }
}
