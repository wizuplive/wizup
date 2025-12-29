import type { Season1ActivationReceipt } from "../types";

/**
 * 🏺 ACTIVATION RECEIPT SINK
 */
export interface ActivationReceiptSink {
  read(seasonId: string): Promise<Season1ActivationReceipt | null>;
  writeOnce(seasonId: string, receipt: Season1ActivationReceipt): Promise<boolean>;
}
