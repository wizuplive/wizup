
import { CUTOVER_RECEIPT_KEY } from "../keys";
import type { CutoverReceiptSink } from "./receiptSink";
import type { CutoverReceiptV1 } from "../types";

export class LocalStorageCutoverReceiptSink implements CutoverReceiptSink {
  constructor(private readonly storage: Storage = window.localStorage) {}

  async read(): Promise<CutoverReceiptV1 | null> {
    try {
      const raw = this.storage.getItem(CUTOVER_RECEIPT_KEY);
      return raw ? (JSON.parse(raw) as CutoverReceiptV1) : null;
    } catch {
      return null;
    }
  }

  // Corrected type name from ProtocolCutoverReceiptV1 to CutoverReceiptV1
  async writeOnce(receipt: CutoverReceiptV1): Promise<{ wrote: boolean; reason?: string }> {
    try {
      const existing = await this.read();
      // fix: Access top-level mode property instead of nested state.mode
      if (existing?.mode === "FIRESTORE_PRIMARY") {
        return { wrote: false, reason: "ALREADY_CUTOVER_IRREVERSIBLE" };
      }
      if (existing && existing.hashes.receiptHash !== receipt.hashes.receiptHash) {
        return { wrote: false, reason: "RECEIPT_HASH_MISMATCH_REFUSED" };
      }
      this.storage.setItem(CUTOVER_RECEIPT_KEY, JSON.stringify(receipt));
      return { wrote: true };
    } catch {
      return { wrote: false, reason: "SINK_ERROR_FAIL_OPEN" };
    }
  }
}