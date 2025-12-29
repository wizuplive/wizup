import type { ActivationReceiptSink } from "./activationReceiptSink";
import type { Season1ActivationReceipt } from "../types";
import { FS_COLLECTIONS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * 🔥 FIRESTORE SHADOW RECEIPT SINK
 */
export class FirestoreShadowReceiptSink implements ActivationReceiptSink {
  async read(seasonId: string): Promise<Season1ActivationReceipt | null> {
    try {
      if (!db) return null;
      const ref = doc(db, FS_COLLECTIONS.activationReceipts, seasonId);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as Season1ActivationReceipt) : null;
    } catch {
      return null;
    }
  }

  async writeOnce(seasonId: string, receipt: Season1ActivationReceipt): Promise<boolean> {
    try {
      if (!db) return false;

      const existing = await this.read(seasonId);
      if (existing?.decision === "ACTIVATED") return false;

      const ref = doc(db, FS_COLLECTIONS.activationReceipts, seasonId);
      await setDoc(ref, receipt, { merge: true });
      return true;
    } catch {
      return false;
    }
  }
}
