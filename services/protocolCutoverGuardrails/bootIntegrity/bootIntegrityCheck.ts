import { getCutoverGuardState } from "../cutoverState";
import type { ProtocolCutoverViolationSink } from "../persistence/violationSink";
import { defaultCutoverViolationSink } from "../persistence/compositeViolationSink";
import { ProtocolCutoverViolationArtifactV1 } from "../types";
import type { FirestoreAvailabilityProbe } from "./types";
import { setSafeNoopLatch } from "./latch";

function mkId(code: string) {
  return `pcv1:${code}:${Date.now().toString(16)}:${Math.random()
    .toString(16)
    .slice(2, 6)}`;
}

/**
 * 🩺 PRODUCTION BOOT INTEGRITY CHECK
 * ===================================
 * Executed at startup to ensure Firestore is available if a cutover exists.
 */
export async function runProductionBootIntegrityCheck(args: {
  violationSink?: ProtocolCutoverViolationSink;
  firestoreProbe: FirestoreAvailabilityProbe;
  persistLatch?: boolean;
  buildTag?: string;
}) {
  const state = getCutoverGuardState();
  const sink = args.violationSink || defaultCutoverViolationSink;

  // Invariant: This check is only relevant if a Cutover Receipt exists.
  if (!state.cutoverIsActive) return { action: "NOOP", reason: "cutover-not-active" as const };

  const fs = await args.firestoreProbe.probe();

  if (fs.available) {
    return { action: "OK", reason: "firestore-available" as const };
  }

  // 🚨 CRITICAL PATH: Cutover Receipt exists but Firestore is unreachable at boot.
  // We MUST latch SAFE_NOOP to prevent any local writes from becoming "canonical".
  
  // 1. Emit CRITICAL violation artifact
  const v: ProtocolCutoverViolationArtifactV1 = {
    version: "v1",
    id: mkId("CUTOVER_ACTIVE_BUT_FIRESTORE_UNAVAILABLE_AT_BOOT"),
    severity: "CRITICAL",
    code: "CUTOVER_ACTIVE_BUT_FIRESTORE_UNAVAILABLE_AT_BOOT",
    env: {
      mode: "production",
      buildTag: args.buildTag || (window as any).WIZUP_BUILD_TAG,
    },
    cutover: {
      cutoverReceiptHash: state.cutoverReceiptHash,
      primaryReadMode: state.primaryReadMode ?? null,
    },
    context: {
      operation: "READ",
      artifactKind: "BOOT_INTEGRITY",
      seasonIdScope: "ALL",
      details: {
        firestoreConfigured: fs.configured,
        firestoreAvailable: fs.available,
        firestoreReason: fs.reason ?? null,
      },
    },
    createdAtMs: Date.now(),
  };

  await sink.emit(v);

  // 2. Irreversibly Latch SAFE_NOOP for the remainder of the session
  setSafeNoopLatch({
    reason: `boot-integrity: cutover active but firestore unavailable (${fs.reason ?? "unknown"})`,
    persist: Boolean(args.persistLatch),
  });

  // 3. Log second violation indicating the system is now in NOOP state
  const v2: ProtocolCutoverViolationArtifactV1 = {
    version: "v1",
    id: mkId("SAFE_NOOP_LATCHED_DUE_TO_BOOT_INTEGRITY"),
    severity: "CRITICAL",
    code: "SAFE_NOOP_LATCHED_DUE_TO_BOOT_INTEGRITY",
    env: {
      mode: "production",
      buildTag: args.buildTag || (window as any).WIZUP_BUILD_TAG,
    },
    cutover: {
      cutoverReceiptHash: state.cutoverReceiptHash,
      primaryReadMode: state.primaryReadMode ?? null,
    },
    context: {
      operation: "WRITE",
      artifactKind: "SAFE_NOOP_LATCH",
      seasonIdScope: "ALL",
      details: {
        latchReason: `boot-integrity`,
      },
    },
    createdAtMs: Date.now(),
  };

  await sink.emit(v2);

  return { action: "SAFE_NOOP_LATCHED", reason: "firestore-unavailable" as const };
}
