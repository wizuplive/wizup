
import type { ProtocolWriteKey, ProtocolWriteResult } from "./types";
import type { ProtocolWriteSink } from "./sinks";
import { protocolWriteFlags } from "./protocolWriteFlags";
import { appendWriteJournalEntry } from "./journal/writeJournal";
import { ensureDualReadLatch } from "../protocolReadRouter/latch/dualReadLatch";
import { emitCriticalProtocolViolation } from "../protocolReadRouter/violations/emitProtocolViolation";
import { enforceNoLocalPrimaryAfterCutover } from "../protocolCutover/enforceNoLocalPrimaryAfterCutover";
import { getSafeNoopLatch } from "../protocolCutoverGuardrails/bootIntegrity/latch";
import { getPrimaryReadMode } from "../protocolCutover/primaryReadModeStore";

/**
 * 🚥 PROTOCOL WRITE ROUTER
 * =======================
 */

export class ProtocolWriteRouter {
  constructor(
    private readonly deps: {
      local: ProtocolWriteSink;
      firestore: ProtocolWriteSink;
    }
  ) {}

  async write<T>(key: ProtocolWriteKey, payload: T): Promise<ProtocolWriteResult> {
    const seasonId = key.seasonId;

    // 🛡️ 1. SAFE_NOOP BOOT LATCH
    const bootLatch = getSafeNoopLatch();
    if (bootLatch.latched) {
      return {
        seasonId, kind: key.kind, communityId: key.communityId,
        local: { ok: false, mode: "NOOP" },
        firestore: { ok: false, mode: "NOOP_DISABLED" },
      };
    }

    // 🚥 2. CUTOVER GUARDRAIL
    const cutoverMode = getPrimaryReadMode();
    const isFirestorePrimary = cutoverMode === "FIRESTORE_PRIMARY";

    if (!isFirestorePrimary) {
      // 🛡️ ENFORCE CUTOVER GUARDRAIL
      const guard = await enforceNoLocalPrimaryAfterCutover({
        operation: "WRITE_PRIMARY",
        storage: "LOCAL",
        context: `ProtocolWriteRouter.write:${key.kind}`,
        seasonId: key.seasonId
      });
      if (guard.allowed === false) {
        return {
          seasonId, kind: key.kind, communityId: key.communityId,
          local: { ok: false, mode: "NOOP" },
          firestore: { ok: false, mode: "NOOP_DISABLED" }
        };
      }
    }

    // 🛡️ 3. RUNTIME DUAL-READ LATCH
    const latch = ensureDualReadLatch(seasonId);

    // 4. Local Write (Primary if pre-cutover, Redundant shadow if post-cutover)
    let localOk = true;
    try {
      await this.deps.local.write(key, payload);
    } catch (e) {
      localOk = false;
    }

    // 5. Firestore Shadow Logic
    let firestoreEnabled = protocolWriteFlags.FIRESTORE_SHADOW_WRITES === true || isFirestorePrimary;
    
    if (!firestoreEnabled) {
      const result: ProtocolWriteResult = {
        seasonId, kind: key.kind, communityId: key.communityId,
        local: { ok: localOk, mode: "WROTE" },
        firestore: { ok: true, mode: "NOOP_DISABLED" },
      };
      this.journal({ key, localOk, localMode: "WROTE", firestoreOk: true, firestoreMode: "NOOP_DISABLED" });
      return result;
    }

    if (latch.latched) {
      void emitCriticalProtocolViolation({
        seasonId: seasonId,
        code: "DUAL_READ_LATCH_BLOCKED_FIRESTORE_FALLBACK_ATTEMPT",
        kind: `WRITE:${key.kind}`,
        communityId: key.communityId,
        note: "Dual-Read Runtime Latch active. Firestore shadow write forced to NOOP.",
      });

      const result: ProtocolWriteResult = {
        seasonId, kind: key.kind, communityId: key.communityId,
        local: { ok: localOk, mode: "WROTE" },
        firestore: { ok: true, mode: "NOOP_DUE_TO_LATCH" },
      };
      this.journal({ key, localOk, localMode: "WROTE", firestoreOk: true, firestoreMode: "NOOP_DUE_TO_LATCH" });
      return result;
    }

    let firestoreOk = true;
    try {
      await this.deps.firestore.write(key, payload);
    } catch (e) {
      firestoreOk = false;
    }

    const result: ProtocolWriteResult = {
      seasonId, kind: key.kind, communityId: key.communityId,
      local: { ok: localOk, mode: "WROTE" },
      firestore: { ok: firestoreOk, mode: "WROTE" },
    };
    this.journal({ key, localOk, localMode: "WROTE", firestoreOk, firestoreMode: "WROTE" });
    return result;
  }

  private journal(args: any) {
    try {
      appendWriteJournalEntry({
        id: `${args.key.seasonId}::${args.key.kind}::${args.key.docId}::${Date.now()}`,
        seasonId: args.key.seasonId,
        kind: args.key.kind,
        communityId: args.key.communityId,
        docId: args.key.docId,
        local: { ok: args.localOk, mode: args.localMode },
        firestore: { ok: args.firestoreOk, mode: args.firestoreMode },
        wroteAtMs: Date.now(),
      });
    } catch (e) { /* fail-open */ }
  }
}
