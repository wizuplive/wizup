import { Season1ViolationArtifact } from "../types/violation";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const LS_INDEX_KEY = "WIZUP::S1::LOCK_VIOLATIONS::INDEX";
const MAX_LS_ENTRIES = 50;

export const violationSink = {
  async write(artifact: Season1ViolationArtifact): Promise<void> {
    try {
      // 1. LocalStorage Capped Store
      const itemKey = `WIZUP::S1::LOCK_VIOLATION::v1::${artifact.id}`;
      localStorage.setItem(itemKey, JSON.stringify(artifact));

      const rawIndex = localStorage.getItem(LS_INDEX_KEY);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      if (!index.includes(artifact.id)) {
        index.unshift(artifact.id);
        localStorage.setItem(LS_INDEX_KEY, JSON.stringify(index.slice(0, MAX_LS_ENTRIES)));
      }

      // 2. Firestore Shadow Write (Merge-only)
      if (db) {
        const ref = doc(db, "zaps_season1_lock_violations", artifact.id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, artifact);
        }
      }
    } catch {
      // fail-open
    }
  }
};
