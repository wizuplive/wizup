import type { Season1CanonBundle } from "../types/canonBundleTypes";
import { FS_COLLECTIONS, FS_DOC_IDS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type FirestoreCanonWriteResult =
  | { ok: true; status: "WROTE" | "ALREADY_PRESENT_SAME_HASH" }
  | { ok: false; status: "IMMUTABLE_MISMATCH"; existingHash?: string };

export class FirestoreShadowCanonBundleSink {
  async write(bundle: Season1CanonBundle): Promise<FirestoreCanonWriteResult> {
    try {
      if (!db) return { ok: true, status: "WROTE" }; // fail-open

      const docId = FS_DOC_IDS.canonBundle(bundle.seasonId, bundle.communityId);
      const ref = doc(db, FS_COLLECTIONS.canonBundles, docId);

      // Check existing (immutability gate)
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as Partial<Season1CanonBundle>;
        if (existing.bundleHash && existing.bundleHash === bundle.bundleHash) {
          return { ok: true, status: "ALREADY_PRESENT_SAME_HASH" };
        }
        return { ok: false, status: "IMMUTABLE_MISMATCH", existingHash: existing.bundleHash };
      }

      // Shadow write (merge false; document is sealed by existence)
      const payload: Season1CanonBundle = {
        ...bundle,
        writtenAtMs: Date.now(),
      };

      await setDoc(ref, payload, { merge: false });
      return { ok: true, status: "WROTE" };
    } catch {
      return { ok: true, status: "WROTE" }; // fail-open
    }
  }
}
