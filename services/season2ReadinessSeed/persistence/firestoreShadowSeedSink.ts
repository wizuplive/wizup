import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Season2ReadinessSeed } from "../types";
import { FS_COLLECTIONS } from "./keys";

export class FirestoreShadowSeedSink {
  async write(seed: Season2ReadinessSeed): Promise<void> {
    if (!db) return;
    try {
      const ref = doc(db, FS_COLLECTIONS.seeds, seed.fromSeasonId);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().hashes?.seedHash) {
        return; // Immutability handled primarily by local sink logic
      }
      await setDoc(ref, seed, { merge: true });
    } catch {
      // Fail-open
    }
  }
}