import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface FreezeBaseline {
  seasonId: string;
  immutableFingerprintHash: string;
  activationReceiptHash: string;
  capturedAtMs: number;
  baselineVersion: "v1";
}

const LS_KEY_PREFIX = "WIZUP::S1::FREEZE_BASELINE::";

export const freezeBaselineSource = {
  async captureAndPersist(baseline: FreezeBaseline): Promise<void> {
    const key = `${LS_KEY_PREFIX}${baseline.seasonId}`;
    
    // 1. Local Write-Once
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(baseline));
    }

    // 2. Firestore Write-Once
    if (db) {
      try {
        const ref = doc(db, "zaps_season1_freeze_baselines", baseline.seasonId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, baseline);
        }
      } catch {
        // Fail-open
      }
    }
  },

  async getBaseline(seasonId: string): Promise<FreezeBaseline | null> {
    try {
      const raw = localStorage.getItem(`${LS_KEY_PREFIX}${seasonId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
