import type { CanonBundleSource } from "./canonBundleSource";
import type { Season1CanonBundle } from "../types/canonBundleTypes";
import { FS_COLLECTIONS, FS_DOC_IDS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * 🔥 FIRESTORE SHADOW CANON BUNDLE SOURCE
 */
export class FirestoreShadowCanonBundleSource implements CanonBundleSource {
  async getCanonBundle(args: { seasonId: string; communityId: string }): Promise<Season1CanonBundle | null> {
    try {
      if (!db) return null;
      const id = FS_DOC_IDS.canonBundle(args.seasonId, args.communityId);
      const ref = doc(db, FS_COLLECTIONS.canonBundles, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return snap.data() as Season1CanonBundle;
    } catch {
      return null; // fail-open
    }
  }
}
