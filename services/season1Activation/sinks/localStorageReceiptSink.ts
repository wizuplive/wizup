import type { ActivationReceiptSink } from "./activationReceiptSink";
import type { Season1ActivationReceipt } from "../types";
import { LS_KEYS } from "../keys";

/**
 * 💾 LOCAL STORAGE RECEIPT SINK
 */
export class LocalStorageReceiptSink implements ActivationReceiptSink {
  constructor(private readonly storage: Storage = window.localStorage) {}

  async read(seasonId: string): Promise<Season1ActivationReceipt | null> {
    try {
      const raw = this.storage.getItem(LS_KEYS.activationReceipt(seasonId));
      return raw ? (JSON.parse(raw) as Season1ActivationReceipt) : null;
    } catch {
      return null;
    }
  }

  async writeOnce(seasonId: string, receipt: Season1ActivationReceipt): Promise<boolean> {
    try {
      const existing = await this.read(seasonId);
      if (existing?.decision === "ACTIVATED") return false;
      this.storage.setItem(LS_KEYS.activationReceipt(seasonId), JSON.stringify(receipt));
      return true;
    } catch {
      return false;
    }
  }
}
