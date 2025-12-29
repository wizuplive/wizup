import { ActivationReceiptV1 } from "../types";
import { ActivationReceiptSink, ReceiptWriteResult } from "./receiptSink";

export class LocalStorageReceiptSink implements ActivationReceiptSink {
  private key(id: string) {
    return `WIZUP::S1::ACTIVATION_RECEIPT::v1::${id}`;
  }

  async read(seasonId: string): Promise<ActivationReceiptV1 | null> {
    try {
      const raw = localStorage.getItem(this.key(seasonId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async write(receipt: ActivationReceiptV1): Promise<ReceiptWriteResult> {
    try {
      const existing = await this.read(receipt.seasonId);
      
      if (existing?.status === "ACTIVATED") {
        if (existing.sealHash === receipt.sealHash) {
          return { ok: true }; // Idempotent
        }
        return { ok: false, refusedBecauseActivated: true };
      }

      localStorage.setItem(this.key(receipt.seasonId), JSON.stringify(receipt));
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}
