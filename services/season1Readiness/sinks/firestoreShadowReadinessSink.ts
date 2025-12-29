
import type { ReadinessDecisionArtifact } from "../types";
import { FS_READINESS_COLLECTIONS, FS_READINESS_DOC_IDS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export class FirestoreShadowReadinessSink {
  async write(artifact: ReadinessDecisionArtifact): Promise<void> {
    try {
      if (!db) return;
      const ref = doc(db, FS_READINESS_COLLECTIONS.decisions, FS_READINESS_DOC_IDS.doc(artifact.seasonId));
      await setDoc(ref, artifact, { merge: true });
    } catch {
      // swallow (fail-open)
    }
  }
}
