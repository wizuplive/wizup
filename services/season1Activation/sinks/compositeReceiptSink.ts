import type { ActivationReceiptSink } from "./activationReceiptSink";
import type { Season1ActivationReceipt } from "../types";

/**
 * 📦 COMPOSITE RECEIPT SINK
 */
export class CompositeReceiptSink implements ActivationReceiptSink {
  constructor(
    private readonly deps: {
      local: ActivationReceiptSink;
      firestore?: ActivationReceiptSink;
      enableFirestore: boolean;
    }
  ) {}

  async read(seasonId: string): Promise<Season1ActivationReceipt | null> {
    const local = await this.deps.local.read(seasonId);
    if (local) return local;
    if (this.deps.enableFirestore && this.deps.firestore) return await this.deps.firestore.read(seasonId);
    return null;
  }

  async writeOnce(seasonId: string, receipt: Season1ActivationReceipt): Promise<boolean> {
    const existing = await this.read(seasonId);
    if (existing?.decision === "ACTIVATED") return false;

    const okLocal = await this.deps.local.writeOnce(seasonId, receipt);
    if (!okLocal) return false;

    if (this.deps.enableFirestore && this.deps.firestore) {
      await this.deps.firestore.writeOnce(seasonId, receipt);
    }
    return true;
  }
}
