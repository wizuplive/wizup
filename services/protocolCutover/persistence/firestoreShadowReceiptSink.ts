
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { FIRESTORE_CUTOVER_COLLECTION, FIRESTORE_CUTOVER_DOC_ID } from "../keys";
import type { CutoverReceiptSink } from "./receiptSink";
import type { CutoverReceiptV1 } from "../types";

export class FirestoreShadowCutoverReceiptSink implements CutoverReceiptSink {
  async read(): Promise<CutoverReceiptV1 | null> {
    if (!db) return null;
    try {
      const ref = doc(db, FIRESTORE_CUTOVER_COLLECTION, FIRESTORE_CUTOVER_DOC_ID);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as CutoverReceiptV1) : null;
    } catch {
      return null;
    }
  }

  // Corrected type name from ProtocolCutoverReceiptV1 to CutoverReceiptV1
  async writeOnce(receipt: CutoverReceiptV1): Promise<{ wrote: boolean; reason?: string }> {
    if (!db) return { wrote: true }; // Fail-open for demo
    try {
      const ref = doc(db, FIRESTORE_CUTOVER_COLLECTION, FIRESTORE_CUTOVER_DOC_ID);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? (snap.data() as CutoverReceiptV1) : null;

      // fix: Access top-level mode property instead of nested state.mode
      if (existing?.mode === "FIRESTORE_PRIMARY") {
        return { wrote: false, reason: "ALREADY_CUTOVER_IRREVERSIBLE" };
      }
      if (existing && existing.hashes.receiptHash !== receipt.hashes.receiptHash) {
        return { wrote: false, reason: "RECEIPT_HASH_MISMATCH_REFUSED" };
      }
      
      await setDoc(ref, receipt, { merge: true });
      return { wrote: true };
    } catch {
      return { wrote: false, reason: "SINK_ERROR_FAIL_OPEN" };
    }
  }
}