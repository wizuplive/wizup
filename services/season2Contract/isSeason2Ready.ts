import { contractSinks } from "./persistence/sinks";

/**
 * 🛡️ SEASON 2 READINESS GATE
 * Returns true only if the contract is READY and ACKNOWLEDGED.
 */
export async function isSeason2Ready(seasonId: string): Promise<boolean> {
  try {
    const ready = contractSinks.readReady(seasonId);
    const ack = contractSinks.readAck(seasonId);

    if (!ready || !ack) return false;

    // Boundary Check: status must be READY
    if (ready.status !== "READY") return false;

    // Hash Alignment Check: Ack must reference the READY contract hash
    // (Assuming hash is based on frozen core and status)
    if (ack.contractHash !== ready.hashes.contractHash) return false;

    return true;
  } catch {
    return false; // fail-closed
  }
}
