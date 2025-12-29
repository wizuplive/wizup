import { ActivationReceiptV1 } from "../types";
import { ActivationReceiptSink, ReceiptWriteResult } from "./receiptSink";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export class FirestoreShadowReceiptSink implements ActivationReceiptSink {
  private collection = "activation_receipts_v1";

  async read(seasonId: string): Promise<ActivationReceiptV1 | null> {
    if (!db) return null;
    try {
      const ref = doc(db, this.collection, seasonId);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as ActivationReceiptV1) : null;
    } catch {
      return null;
    }
  }

  async write(receipt: ActivationReceiptV1): Promise<ReceiptWriteResult> {
    if (!db) return { ok: true }; // Fail-open (demo mode)

    try {
      const ref = doc(db, this.collection, receipt.seasonId);
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().status === "ACTIVATED") {
        return { ok: false, refusedBecauseActivated: true };
      }

      await setDoc(ref, receipt, { merge: true });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}
