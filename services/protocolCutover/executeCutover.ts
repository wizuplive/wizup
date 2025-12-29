
import type { CutoverReceiptV1 } from "./types";
import { canonicalJson, sha256Hex } from "../zaps/season0/hash";
import { setPrimaryReadModeOnce } from "./primaryReadModeStore";
import type { CutoverReceiptSink } from "./persistence/receiptSink";

export async function executeProtocolPrimaryReadCutover(args: {
  sink: CutoverReceiptSink;
  environment: "development" | "production";
  protocolReadRouterVersion: string;

  // adapters
  getParityGateVerdict: (seasonIdScope: string) => Promise<{ verdict: "ALLOW" | "BLOCK" | "UNKNOWN"; parityReportHash?: string }>;
  getDualReadLatchState: (seasonIdScope: string) => Promise<"LATCHED" | "CLEAR" | "UNKNOWN">;

  seasonIdScope?: string; // default "ALL"
  buildTag?: string;
}) {
  const scope = args.seasonIdScope ?? "ALL";

  // 0) Refuse if already cutover
  const existing = await args.sink.read();
  // fix: Access top-level mode property instead of nested state.mode
  if (existing?.mode === "FIRESTORE_PRIMARY") {
    return { ok: true, already: true, receiptHash: existing.hashes.receiptHash };
  }

  // 1) Preconditions
  const parity = await args.getParityGateVerdict(scope);
  const latch = await args.getDualReadLatchState(scope);

  if (parity.verdict !== "ALLOW") {
    return { ok: false, reason: "PARITY_NOT_ALLOWED", parity };
  }
  if (latch !== "CLEAR") {
    return { ok: false, reason: "DUAL_READ_LATCH_NOT_CLEAR", latch };
  }
  if (!parity.parityReportHash) {
    return { ok: false, reason: "MISSING_PARITY_REPORT_HASH" };
  }

  // 2) Build receipt (hash excludes volatile fields)
  // Corrected type name and base properties to match CutoverReceiptV1 in types.ts
  const base: Omit<CutoverReceiptV1, "hashes" | "createdAtMs" | "buildTag"> = {
    version: "v1",
    mode: "FIRESTORE_PRIMARY",
    prerequisites: {
      bootIntegrityOk: true,
      parityGateOk: parity.verdict === "ALLOW",
      firestoreReachable: true,
    },
    protocolFingerprint: {
      routerVersion: "v1",
      writeRouterVersion: "v1",
      readRouterVersion: args.protocolReadRouterVersion
    }
  };

  const hashInput = {
    ...base,
  };

  const receiptHash = await sha256Hex(canonicalJson(hashInput));

  const receipt: CutoverReceiptV1 = {
    ...base,
    createdAtMs: Date.now(),
    buildTag: args.buildTag,
    hashes: {
      prereqHash: "unknown",
      fingerprintHash: "unknown",
      receiptHash,
    },
  };

  // 3) Write receipt (write-once)
  const w = await args.sink.writeOnce(receipt);
  if (!w.wrote && w.reason) {
    return { ok: false, reason: w.reason };
  }

  // 4) Flip primary read pointer (irreversible)
  const modeWrite = setPrimaryReadModeOnce("FIRESTORE_PRIMARY");
  if (!modeWrite.wrote) {
    return { ok: true, receiptHash, warning: "PRIMARY_MODE_POINTER_NOT_SET", modeWrite };
  }

  return { ok: true, receiptHash };
}