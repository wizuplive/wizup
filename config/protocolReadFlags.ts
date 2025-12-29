/**
 * 🚩 PROTOCOL READ CUTOVER FLAGS
 * ==============================
 */

export type ProtocolReadFlags = {
  // Hard env gate: true only in dev-like environments
  DEV_PROTOCOL_READ_ROUTER: boolean;

  // Manual toggle: developer must explicitly enable Firestore-first reads
  FIRESTORE_FIRST_READS: boolean;

  // Parity: compare FS vs LS when both available (dev-only)
  PARITY_WATCHDOG: boolean;

  // If true, router will *attempt* Firestore, but will always fallback to LS on any error
  FAIL_OPEN_FALLBACK: boolean;

  // Parity Summary Aggregator (dev-only)
  PARITY_SUMMARY_AGGREGATOR: boolean;
  PARITY_BLOCK_MISMATCH_RATE: number; // e.g. 0.02 => block if >2% mismatch
  PARITY_MIN_SAMPLE: number; // don’t block on tiny sample sizes
};

function isDevEnv(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV === "development";
}

export const protocolReadFlags: ProtocolReadFlags = {
  DEV_PROTOCOL_READ_ROUTER: isDevEnv(),
  FIRESTORE_FIRST_READS: false, // Default to LS-primary for safety
  PARITY_WATCHDOG: false,       // Default to silent
  FAIL_OPEN_FALLBACK: true,

  PARITY_SUMMARY_AGGREGATOR: false,
  PARITY_BLOCK_MISMATCH_RATE: 0.02,
  PARITY_MIN_SAMPLE: 10,
};
