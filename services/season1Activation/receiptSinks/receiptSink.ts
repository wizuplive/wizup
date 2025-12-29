import { ActivationReceiptV1 } from "../types";

export interface ReceiptWriteResult {
  ok: boolean;
  refusedBecauseActivated?: boolean;
}

export interface ActivationReceiptSink {
  write(receipt: ActivationReceiptV1): Promise<ReceiptWriteResult>;
  read(seasonId: string): Promise<ActivationReceiptV1 | null>;
}