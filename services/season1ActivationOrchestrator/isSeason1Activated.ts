/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { defaultReceiptSink } from "./persistence/compositeReceiptSink";

/**
 * 🔒 ACTIVATION ENFORCEMENT GATE
 * ===============================
 * The single source of truth for whether Season 1 reality is "live".
 */
export async function isSeason1Activated(seasonId: string): Promise<boolean> {
  try {
    const receipt = await defaultReceiptSink.read(seasonId);
    return receipt?.decision === "ACTIVATED";
  } catch {
    return false; // Fail-closed regarding live status
  }
}
