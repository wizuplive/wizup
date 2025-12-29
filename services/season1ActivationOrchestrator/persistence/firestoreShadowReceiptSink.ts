/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { ActivationReceiptSink } from "./receiptSink";
import { ActivationReceipt } from "../types/activationReceipt";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export class FirestoreShadowReceiptSink implements ActivationReceiptSink {
  private collection = "activation_receipts_v1";

  async write(receipt: ActivationReceipt): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, this.collection, receipt.seasonId);
      
      // Immutability Check
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().decision === "ACTIVATED") {
        return;
      }

      await setDoc(docRef, receipt, { merge: true });
    } catch {
      // Swallow
    }
  }

  async read(seasonId: string): Promise<ActivationReceipt | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, this.collection, seasonId));
      return snap.exists() ? (snap.data() as ActivationReceipt) : null;
    } catch {
      return null;
    }
  }
}
