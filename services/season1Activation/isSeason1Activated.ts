import { LocalStorageReceiptSink } from "./sinks/localStorageReceiptSink";

/**
 * 🔒 ACTIVATION ENFORCEMENT GATE
 */
export async function isSeason1Activated(seasonId: string): Promise<boolean> {
  const sink = new LocalStorageReceiptSink();
  const receipt = await sink.read(seasonId);
  return receipt?.decision === "ACTIVATED";
}
