import { Season1ActivationReceipt } from "../types/receiptTypes";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { LS_KEYS, FS_COLLECTIONS } from "../keys";

export interface ReceiptSource {
  getReceipt(seasonId: string): Promise<Season1ActivationReceipt | null>;
}

export class LocalStorageReceiptSource implements ReceiptSource {
  async getReceipt(seasonId: string): Promise<Season1ActivationReceipt | null> {
    try {
      const raw = localStorage.getItem(LS_KEYS.activationReceipt(seasonId));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

export class FirestoreShadowReceiptSource implements ReceiptSource {
  async getReceipt(seasonId: string): Promise<Season1ActivationReceipt | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, FS_COLLECTIONS.activationReceipts, seasonId));
      return snap.exists() ? (snap.data() as Season1ActivationReceipt) : null;
    } catch { return null; }
  }
}
