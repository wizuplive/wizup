import { ActivationReceiptV1 } from "../types";
import { ActivationReceiptSink, ReceiptWriteResult } from "./receiptSink";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { season1TemporalLock } from "../../season1TemporalLock/season1TemporalLock";
import { season1FreezeProof } from "../../season1FreezeProof/season1FreezeProof";
import { seasonFinalizedGate } from "../../seasonEnd/seasonFinalizedGate";
import { shadowSinks } from "../../firestoreShadow/sinks/shadowSinks";

const LS_KEY_PREFIX = "WIZUP::S1::ACTIVATION_RECEIPT::v1::";
const FS_COLLECTION = "activation_receipts_v1";

export class CompositeReceiptSink implements ActivationReceiptSink {
  async read(seasonId: string): Promise<ActivationReceiptV1 | null> {
    try {
      const raw = localStorage.getItem(`${LS_KEY_PREFIX}${seasonId}`);
      if (raw) return JSON.parse(raw);
      
      if (db) {
        const snap = await getDoc(doc(db, FS_COLLECTION, seasonId));
        return snap.exists() ? (snap.data() as ActivationReceiptV1) : null;
      }
    } catch { return null; }
    return null;
  }

  async write(receipt: ActivationReceiptV1): Promise<ReceiptWriteResult> {
    // --- 🏁 SEASON FINALIZED GUARD ---
    const finalizedRes = await seasonFinalizedGate.requireSeasonNotFinalizedOrNoop(receipt.seasonId, "activationReceiptWrite");
    if (!finalizedRes.allowed) return { ok: false };

    // --- ❄️ CRITICAL FREEZE GUARD ---
    const freezeRes = await season1FreezeProof.assertSeason1NotFrozenOrNoop(receipt.seasonId);
    if (!freezeRes.allowed) return { ok: false };

    // --- 🔒 TEMPORAL LOCK ENFORCEMENT ---
    const lockRes = await season1TemporalLock.enforceSeason1WritePolicy({
      seasonId: receipt.seasonId,
      objectType: "activationReceipt",
      proposedHash: receipt.sealHash,
      existingHashLoader: async () => {
        const existing = await this.read(receipt.seasonId);
        return existing?.sealHash || null;
      }
    });

    if (!lockRes.allowed) {
      return { ok: false, refusedBecauseActivated: true };
    }

    try {
      const existing = await this.read(receipt.seasonId);
      if (existing?.status === "ACTIVATED") {
        return { ok: true, refusedBecauseActivated: true };
      }

      // 1. Local Write
      localStorage.setItem(`${LS_KEY_PREFIX}${receipt.seasonId}`, JSON.stringify(receipt));
      
      // 2. Deterministic Firestore Shadow Write
      shadowSinks.writeActivationReceipt(receipt);

      return { ok: true };
    } catch (e) {
      console.error("[SINK] Receipt write failure", e);
      return { ok: false };
    }
  }
}

export const defaultReceiptSink = new CompositeReceiptSink();
