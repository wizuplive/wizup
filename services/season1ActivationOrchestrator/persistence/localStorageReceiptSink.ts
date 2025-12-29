/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { ActivationReceiptSink } from "./receiptSink";
import { ActivationReceipt } from "../types/activationReceipt";

const KEY_PREFIX = "WIZUP::S1::ACTIVATION_RECEIPT::v1::";

export class LocalStorageReceiptSink implements ActivationReceiptSink {
  async write(receipt: ActivationReceipt): Promise<void> {
    try {
      const key = `${KEY_PREFIX}${receipt.seasonId}`;
      const existing = await this.read(receipt.seasonId);
      
      // Immutability Rule: If an activated receipt exists, do not overwrite.
      if (existing?.decision === "ACTIVATED") {
        return;
      }

      localStorage.setItem(key, JSON.stringify(receipt));
    } catch {
      // Swallow errors as per fail-open requirement
    }
  }

  async read(seasonId: string): Promise<ActivationReceipt | null> {
    try {
      const raw = localStorage.getItem(`${KEY_PREFIX}${seasonId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
