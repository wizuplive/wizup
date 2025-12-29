import type { CutoverReceiptV1 } from "./types";
import { canonicalJson, fnv1aHex } from "./hash";
import { readCutoverReceipt, writeCutoverReceiptWriteOnce } from "./cutoverReceiptStore";

/**
 * 🚀 PROTOCOL CUTOVER CEREMONY
 * ============================
 */

export async function executeProtocolPrimaryReadSwitch(args: {
  // These are required proofs:
  runBootIntegrity: () => Promise<{ ok: boolean; firestoreReachable: boolean; reason?: string }>;
  runParityGate: () => Promise<{ ok: boolean; reason?: string }>;

  // Versions for protocol fingerprinting:
  routerVersions: {
    routerVersion: string;
    writeRouterVersion: string;
    readRouterVersion: string;
  };

  // Optional build metadata (excluded from deterministic hash):
  buildTag?: string;
}): Promise<{ ok: boolean; receipt?: CutoverReceiptV1; existing?: CutoverReceiptV1; reason?: string }> {
  // 0) Idempotency check
  const existing = readCutoverReceipt();
  if (existing) return { ok: true, existing };

  // 1) Execute Proofs
  const boot = await args.runBootIntegrity();
  if (!boot.ok || !boot.firestoreReachable) {
    return { ok: false, reason: boot.reason ?? "BOOT_INTEGRITY_FAILED" };
  }

  const parity = await args.runParityGate();
  if (!parity.ok) {
    return { ok: false, reason: parity.reason ?? "PARITY_GATE_BLOCK" };
  }

  // 2) Generate Deterministic Hashes
  const prerequisites = {
    bootIntegrityOk: boot.ok,
    parityGateOk: parity.ok,
    firestoreReachable: boot.firestoreReachable,
  };
  const prereqHash = fnv1aHex(canonicalJson(prerequisites));
  const fingerprintHash = fnv1aHex(canonicalJson(args.routerVersions));

  // 3) Build Base Receipt (exclude volatile fields from identification hash)
  const base: Omit<CutoverReceiptV1, "hashes" | "createdAtMs" | "buildTag"> = {
    version: "v1",
    mode: "FIRESTORE_PRIMARY",
    prerequisites,
    protocolFingerprint: args.routerVersions,
  };

  const receiptHash = fnv1aHex(canonicalJson(base));

  const receipt: CutoverReceiptV1 = {
    ...base,
    createdAtMs: Date.now(),
    buildTag: args.buildTag,
    hashes: {
      prereqHash,
      fingerprintHash,
      receiptHash,
    },
  };

  // 4) Irreversible Persistence
  const wr = writeCutoverReceiptWriteOnce(receipt);
  if (!wr.ok) return { ok: false, reason: "RECEIPT_WRITE_FAILED" };
  if (wr.existing) return { ok: true, existing: wr.existing };

  console.log("%c[CUTOVER] Primary Read Switch Executed Successfully.", "color: #22c55e; font-weight: bold;");
  return { ok: true, receipt };
}
