
import { CUTOVER_RECEIPT_KEY } from "./keys";
import type { CutoverReceiptV1 } from "./types";

/**
 * 📖 CUTOVER RECEIPT SOURCE
 */

export function getCutoverReceipt(): CutoverReceiptV1 | null {
  try {
    const raw = window.localStorage.getItem(CUTOVER_RECEIPT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CutoverReceiptV1;
    // Basic structural validation
    // fix: Check parsed.hashes.receiptHash instead of parsed.hash
    if (parsed?.version !== "v1" || typeof parsed.hashes?.receiptHash !== "string") return null;
    return parsed;
  } catch {
    return null; // fail-open
  }
}

export function hasCutoverReceipt(): boolean {
  return getCutoverReceipt() !== null;
}