
import type { ProtocolArtifactKey, ProtocolArtifactSource, ReadResult } from "./types";
import { protocolReadFlags } from "../../config/protocolReadFlags";
import { ParityWatchdog } from "./parity/parityWatchdog";
import { ensureDualReadLatch } from "./latch/dualReadLatch";
import { emitCriticalProtocolViolation } from "./violations/emitProtocolViolation";
import { getPrimaryReadMode } from "../protocolCutover/primaryReadModeStore";
import { enforceNoLocalPrimaryAfterCutover } from "../protocolCutover/enforceNoLocalPrimaryAfterCutover";
import { getSafeNoopLatch } from "../protocolCutoverGuardrails/bootIntegrity/latch";

/**
 * 🚥 PROTOCOL READ ROUTER
 * =======================
 */

export type ProtocolReadPurpose = "READ_ONLY" | "WRITE_BEARING";

/**
 * Authoritative Read Utility
 */
export async function protocolRead<T>(args: {
  seasonId: string;
  readKey: string;
  localRead: () => T | null;
  firestoreRead?: () => Promise<T | null>;
  purpose?: ProtocolReadPurpose;
}): Promise<ReadResult<T>> {
  
  // 🛡️ 1. SAFE_NOOP BOOT LATCH
  const bootLatch = getSafeNoopLatch();
  if (bootLatch.latched && args.purpose === "WRITE_BEARING") {
    return { value: null, source: "NOOP", meta: { reason: "SAFE_NOOP_LATCH_ACTIVE" } };
  }

  // 🛡️ 2. RUNTIME DUAL-READ LATCH
  const latch = ensureDualReadLatch(args.seasonId);
  if (latch.latched) {
    void emitCriticalProtocolViolation({
      seasonId: args.seasonId,
      code: "DUAL_READ_LATCH_BLOCKED_FIRESTORE_FIRST_ATTEMPT",
      kind: "READ_REDIRECTION",
      note: "Dual-Read Latch active. Firestore read suppressed.",
    });
    // Fallback is primary in latch mode
    return { value: args.localRead(), source: "LOCAL" };
  }

  // 🚥 3. CUTOVER RESOLUTION
  const mode = getPrimaryReadMode();
  const isFirestorePrimary = mode === "FIRESTORE_PRIMARY";

  // 🌐 Firestore-first Path (Primary)
  if (isFirestorePrimary && args.firestoreRead) {
    try {
      const remote = await args.firestoreRead();
      if (remote) return { value: remote, source: "FIRESTORE" };
    } catch (e) { /* fail-open to fallback */ }
  }

  // 🗄️ Local-Primary Check (Refused in Prod Post-Cutover)
  if (!isFirestorePrimary) {
    // 🛡️ ENFORCE CUTOVER GUARDRAIL
    const guard = await enforceNoLocalPrimaryAfterCutover({
      operation: "READ_PRIMARY",
      storage: "LOCAL",
      context: `protocolRead:${args.readKey}`,
      seasonId: args.seasonId
    });

    if (guard.allowed === false) {
      return { value: null, source: "NOOP", meta: { error: guard.reason } };
    }
    
    const local = args.localRead();
    if (local) return { value: local, source: "LOCAL" };
  } else {
    // Firestore Primary fallback to local (allowed as secondary)
    const local = args.localRead();
    if (local) return { value: local, source: "LOCAL" };
  }

  return { value: null, source: "NOOP" };
}

export class ProtocolReadRouter {
  private parity = new ParityWatchdog({
    enabled: () => protocolReadFlags.DEV_PROTOCOL_READ_ROUTER && protocolReadFlags.PARITY_WATCHDOG,
  });

  constructor(private readonly deps: {
    local: ProtocolArtifactSource;
    firestore: ProtocolArtifactSource;
  }) {}

  async read<T>(key: ProtocolArtifactKey): Promise<ReadResult<T>> {
    const seasonId = key.seasonId;
    const latch = ensureDualReadLatch(seasonId);

    if (latch.latched) {
      return await this.deps.local.read<T>(key);
    }

    const cutoverMode = getPrimaryReadMode();
    const isFirestorePrimary = cutoverMode === "FIRESTORE_PRIMARY";

    if (!isFirestorePrimary) {
      // 🛡️ ENFORCE CUTOVER GUARDRAIL
      const guard = await enforceNoLocalPrimaryAfterCutover({
        operation: "READ_PRIMARY",
        storage: "LOCAL",
        context: `ProtocolReadRouter.read:${key.kind}`,
        seasonId
      });
      if (guard.allowed === false) return { value: null, source: "NOOP" };
    }

    const devOk = protocolReadFlags.DEV_PROTOCOL_READ_ROUTER === true;
    const fsFirst = (devOk && protocolReadFlags.FIRESTORE_FIRST_READS === true) || isFirestorePrimary;

    const lsPromise = this.deps.local.read<T>(key);

    if (!fsFirst) {
      return await lsPromise;
    }

    let fs: ReadResult<T> = { value: null, source: "NOOP" };
    let ls: ReadResult<T> = { value: null, source: "NOOP" };

    try {
      fs = await this.deps.firestore.read<T>(key);
    } catch (e) {
      fs = { value: null, source: "NOOP" };
    }

    const needLs = protocolReadFlags.PARITY_WATCHDOG || protocolReadFlags.FAIL_OPEN_FALLBACK;
    if (needLs) {
      try { 
        ls = await lsPromise; 
      } catch (e) { 
        ls = { value: null, source: "NOOP" }; 
      }
    }

    if (protocolReadFlags.PARITY_WATCHDOG) {
      this.parity.observe(key, ls, fs);
    }

    if (fs.value) return fs;
    if (protocolReadFlags.FAIL_OPEN_FALLBACK) return ls;
    
    return fs;
  }
}
