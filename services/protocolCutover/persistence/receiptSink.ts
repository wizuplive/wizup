
import type { CutoverReceiptV1 } from "../types";

/**
 * 🏺 CUTOVER RECEIPT SINK INTERFACE
 */
export interface CutoverReceiptSink {
  // Corrected type name from ProtocolCutoverReceiptV1 to CutoverReceiptV1
  writeOnce(receipt: CutoverReceiptV1): Promise<{ wrote: boolean; reason?: string }>;
  read(): Promise<CutoverReceiptV1 | null>;
}