import { FreezeBaseline } from "./freezeBaselineSource";

export type DriftResult =
  | { status: "OK" }
  | { status: "DRIFT"; reason: string; baselineHash: string; currentHash: string }
  | { status: "BASELINE_MISSING" }
  | { status: "NOT_APPLICABLE" };

export const driftDetector = {
  detectCanonicalDrift(
    seasonId: string,
    currentHash: string,
    baseline: FreezeBaseline | null,
    isActivated: boolean
  ): DriftResult {
    if (!isActivated) return { status: "NOT_APPLICABLE" };
    if (!baseline) return { status: "BASELINE_MISSING" };

    if (currentHash !== baseline.immutableFingerprintHash) {
      return {
        status: "DRIFT",
        reason: "LIVE_FINGERPRINT_MISMATCH",
        baselineHash: baseline.immutableFingerprintHash,
        currentHash
      };
    }

    return { status: "OK" };
  }
};
