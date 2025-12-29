/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import type { ActivationReceipt } from "../types/activationReceipt";

export interface ActivationReceiptSink {
  write(receipt: ActivationReceipt): Promise<void>;
  read(seasonId: string): Promise<ActivationReceipt | null>;
}
