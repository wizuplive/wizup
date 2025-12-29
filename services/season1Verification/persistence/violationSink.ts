import { Season1ViolationArtifact } from "../types/violationTypes";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface Season1ViolationSink {
  write(artifact: Season1ViolationArtifact): Promise<void>;
}

export class LocalStorageViolationSink implements Season1ViolationSink {
  async write(artifact: Season1ViolationArtifact): Promise<void> {
    try {
      const indexKey = "wizup:season1:violations:index:v1";
      const itemKey = `wizup:season1:violations:v1:${artifact.seasonId}:${artifact.communityId}:${artifact.id}`;
      
      if (localStorage.getItem(itemKey)) return;

      localStorage.setItem(itemKey, JSON.stringify(artifact));

      const indexRaw = localStorage.getItem(indexKey);
      const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
      index.unshift(itemKey);
      
      const capped = index.slice(0, 100);
      localStorage.setItem(indexKey, JSON.stringify(capped));
    } catch {}
  }
}

export class FirestoreShadowViolationSink implements Season1ViolationSink {
  private collection = "zaps_season1_violation_artifacts";

  async write(artifact: Season1ViolationArtifact): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, this.collection, artifact.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) return;

      await setDoc(docRef, artifact);
    } catch {}
  }
}

export class CompositeViolationSink implements Season1ViolationSink {
  constructor(private sinks: Season1ViolationSink[]) {}
  async write(artifact: Season1ViolationArtifact): Promise<void> {
    await Promise.all(this.sinks.map(s => s.write(artifact).catch(() => {})));
  }
}