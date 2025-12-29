import { CUTOVER_RECEIPT_KEY } from "./keys";
import { runProductionBootIntegrityCheck } from "../protocolCutoverGuardrails/bootIntegrity/bootIntegrityCheck";
import { getSafeNoopLatch } from "../protocolCutoverGuardrails/bootIntegrity/latch";
import type { ProtocolCutoverViolationSink } from "../protocolCutoverGuardrails/persistence/violationSink";
import type { CutoverDryRunKind } from "./types";
import { firestoreProbe } from "../protocolCutoverGuardrails/bootIntegrity/firestoreProbe";

/**
 * 🧪 CUTOVER DRY-RUN RUNNER
 */

function isDev(): boolean {
  // @ts-ignore
  const mode = import.meta?.env?.MODE;
  if (typeof mode === "string") return mode !== "production";
  return process.env.NODE_ENV !== "production";
}

export async function runCutoverDryRuns(args: {
  violationSink: ProtocolCutoverViolationSink;
  forcePingResult?: { down?: boolean; up?: boolean };
}): Promise<Array<{ kind: CutoverDryRunKind; ok: boolean; reason?: string; latchedAfter: boolean }>> {
  if (!isDev()) return [];

  // Ensure receipt exists for the duration of the dry-run (simulation)
  try {
    if (!window.localStorage.getItem(CUTOVER_RECEIPT_KEY)) {
      window.localStorage.setItem(
        CUTOVER_RECEIPT_KEY,
        JSON.stringify({ version: "v1", mode: "PRIMARY_READ_SWITCH", createdAtMs: Date.now(), hash: "DRYRUN" })
      );
    }
  } catch { /* ignore */ }

  const results: Array<{ kind: CutoverDryRunKind; ok: boolean; reason?: string; latchedAfter: boolean }> = [];

  // DryRun A: Firestore DOWN => should latch SAFE_NOOP
  {
    const res = await runProductionBootIntegrityCheck({
      firestoreProbe: {
        probe: async () => ({
          configured: true,
          available: false,
          reason: "Dry-run force-down"
        })
      },
      violationSink: args.violationSink,
    });
    results.push({
      kind: "BOOT_INTEGRITY_DRYRUN_FIRESTORE_DOWN",
      ok: res.action === "SAFE_NOOP_LATCHED",
      reason: res.reason,
      latchedAfter: getSafeNoopLatch().latched,
    });
  }

  // DryRun B: Firestore UP => should be nominal
  // (Note: latch is irreversible once set in storage, so B should ideally run first in clean storage)
  {
    const res = await runProductionBootIntegrityCheck({
      firestoreProbe: {
        probe: async () => ({
          configured: true,
          available: true
        })
      },
      violationSink: args.violationSink,
    });
    results.push({
      kind: "BOOT_INTEGRITY_DRYRUN_FIRESTORE_UP",
      ok: res.action === "OK",
      reason: res.reason,
      latchedAfter: getSafeNoopLatch().latched,
    });
  }

  return results;
}
