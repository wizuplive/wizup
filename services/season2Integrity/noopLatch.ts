import { NoopLatchV1 } from "./types";
import { LS_KEYS, FS_COLLECTIONS } from "./keys";
import { sha256Hex, canonicalize } from "../season2Activation/hash";
import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function isSeason2NoopLatched(seasonId: string): Promise<boolean> {
  if (!seasonId) return false;
  return !!localStorage.getItem(LS_KEYS.NOOP_LATCH(seasonId));
}

export async function latchSeason2Noop(args: {
  seasonId: string;
  reason: NoopLatchV1["reason"];
  sealedContractSealHash: string;
  fingerprintHashAtTrigger?: string;
}): Promise<NoopLatchV1 | null> {
  const key = LS_KEYS.NOOP_LATCH(args.seasonId);
  if (localStorage.getItem(key)) return null;

  const latch: Omit<NoopLatchV1, "hash"> = {
    schemaVersion: "v1",
    seasonId: args.seasonId,
    triggeredAtMs: Date.now(),
    reason: args.reason,
    fingerprintHashAtTrigger: args.fingerprintHashAtTrigger,
    sealedContractSealHash: args.sealedContractSealHash
  };

  const hash = await sha256Hex(canonicalize({ ...latch, triggeredAtMs: undefined }));
  const finalLatch: NoopLatchV1 = { ...latch, hash };

  try {
    localStorage.setItem(key, JSON.stringify(finalLatch));

    if (db) {
      await setDoc(doc(db, FS_COLLECTIONS.NOOP_LATCHES, args.seasonId), finalLatch, { merge: true });
    }

    console.error(`%c[INTEGRITY_CRITICAL] Season ${args.seasonId} LATCHED to NOOP. Reason: ${args.reason}`, "color: white; background: red; font-weight: bold;");
    return finalLatch;
  } catch {
    return null;
  }
}
