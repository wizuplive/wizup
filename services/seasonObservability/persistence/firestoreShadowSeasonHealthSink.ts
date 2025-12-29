import { SeasonHealthSink } from "./seasonHealthSink";
import { SeasonHealthArtifactV1 } from "../types";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export class FirestoreShadowSeasonHealthSink implements SeasonHealthSink {
  private collection = "zaps_season_health_artifacts_v1";

  async write(artifact: SeasonHealthArtifactV1): Promise<boolean> {
    if (!db) return true;
    try {
      const ref = doc(db, this.collection, artifact.seasonId);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().hashes?.outputHash === artifact.hashes.outputHash) {
        return true;
      }
      await setDoc(ref, artifact, { merge: true });
      return true;
    } catch {
      return false;
    }
  }

  async read(seasonId: string): Promise<SeasonHealthArtifactV1 | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, this.collection, seasonId));
      return snap.exists() ? (snap.data() as SeasonHealthArtifactV1) : null;
    } catch {
      return null;
    }
  }
}
