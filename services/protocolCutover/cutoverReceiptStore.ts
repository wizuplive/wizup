import { CUTOVER_RECEIPT_KEY } from "./keys";
import type { CutoverReceiptV1 } from "./types";

/**
 * 🏺 CUTOVER RECEIPT STORE
 */

export function readCutoverReceipt(): CutoverReceiptV1 | null {
  try {
    const raw = window.localStorage.getItem(CUTOVER_RECEIPT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CutoverReceiptV1;
    if (parsed?.version !== "v1") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCutoverReceiptWriteOnce(receipt: CutoverReceiptV1): { ok: boolean; existing?: CutoverReceiptV1 } {
  try {
    const existing = readCutoverReceipt();
    if (existing) return { ok: true, existing };
    window.localStorage.setItem(CUTOVER_RECEIPT_KEY, JSON.stringify(receipt));
    return { ok: true };
  } catch {
    // fail-open: do not throw
    return { ok: false };
  }
}
