import { RuntimeFingerprintV1 } from "../types";
import { LS_KEYS, FS_COLLECTIONS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const runtimeFingerprintSink = {
  async write(fingerprint: RuntimeFingerprintV1): Promise<boolean> {
    const key = LS_KEYS.FINGERPRINT(fingerprint.seasonId);
    
    // 1. Local Immutability Gate
    if (localStorage.getItem(key)) {
      const existing = JSON.parse(localStorage.getItem(key)!) as RuntimeFingerprintV1;
      return existing.hashes.fingerprintHash === fingerprint.hashes.fingerprintHash;
    }

    try {
      // 2. Persist Local
      localStorage.setItem(key, JSON.stringify(fingerprint));

      // 3. Firestore Shadow (Merge-only)
      if (db) {
        const ref = doc(db, FS_COLLECTIONS.FINGERPRINTS, fingerprint.seasonId);
        await setDoc(ref, fingerprint, { merge: true });
      }
      return true;
    } catch (e) {
      return false; // fail-open
    }
  },

  read(seasonId: string): RuntimeFingerprintV1 | null {
    const raw = localStorage.getItem(LS_KEYS.FINGERPRINT(seasonId));
    return raw ? JSON.parse(raw) : null;
  }
};
