import { listWriteJournalEntries } from "../journal/writeJournal";
import type { ShadowWriteParityFinding } from "./types";
import { ensureDualReadLatch } from "../../protocolReadRouter/latch/dualReadLatch";
import { emitCriticalProtocolViolation } from "../../protocolReadRouter/violations/emitProtocolViolation";
import { firestoreShadowExists } from "./shadowExistsAdapter";

export async function runShadowWriteParityMonitor(args: {
  seasonId: string;
  maxEntries?: number; // cap scan
  blockThresholdMissing?: number; // e.g. 1
}): Promise<ShadowWriteParityFinding> {
  const maxEntries = args.maxEntries ?? 1500;
  const blockThresholdMissing = args.blockThresholdMissing ?? 1;

  const all = listWriteJournalEntries()
    .filter((e) => e.seasonId === args.seasonId)
    .slice(0, maxEntries);

  const latch = ensureDualReadLatch(args.seasonId);

  const missingInFirestore: ShadowWriteParityFinding["missingInFirestore"] = [];
  const localWriteFailures: ShadowWriteParityFinding["localWriteFailures"] = [];

  let expectedShadowWrites = 0;

  // If latched: parity is informational only.
  if (!latch.latched) {
    // Only verify entries that claim Firestore WROTE
    for (const e of all) {
      if (!e.local.ok) {
        localWriteFailures.push({ kind: e.kind, docId: e.docId, communityId: e.communityId });
        continue;
      }

      if (e.firestore.mode !== "WROTE") continue;

      expectedShadowWrites += 1;

      const exists = await firestoreShadowExists({
        kind: e.kind,
        seasonId: e.seasonId,
        communityId: e.communityId,
        docId: e.docId,
      });

      if (!exists) {
        missingInFirestore.push({ kind: e.kind, docId: e.docId, communityId: e.communityId });
      }
    }
  }

  const verdict: ShadowWriteParityFinding["verdict"] =
    latch.latched
      ? "WARN"
      : missingInFirestore.length >= blockThresholdMissing
        ? "BLOCK"
        : missingInFirestore.length > 0
          ? "WARN"
          : "PASS";

  const finding: ShadowWriteParityFinding = {
    seasonId: args.seasonId,
    missingInFirestore,
    localWriteFailures,
    latchedSeasons: latch.latched ? [args.seasonId] : [],
    checkedAtMs: Date.now(),
    verdict,
    stats: {
      entriesSeen: all.length,
      expectedShadowWrites,
      missingShadowWrites: missingInFirestore.length,
    },
  };

  // If we detect missing shadow writes in a non-latched season, emit a CRITICAL violation.
  if (!latch.latched && missingInFirestore.length > 0) {
    void emitCriticalProtocolViolation({
      seasonId: args.seasonId,
      code: "DUAL_READ_LATCH_BLOCKED_FIRESTORE_FALLBACK_ATTEMPT", // Reusing code for write parity
      kind: "MONITOR:SHADOW_WRITE_PARITY",
      note: `Missing ${missingInFirestore.length} Firestore shadow docs for local writes; season not latched.`,
    });
  }

  return finding;
}
