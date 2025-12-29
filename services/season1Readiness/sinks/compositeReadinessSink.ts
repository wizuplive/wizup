
import type { ReadinessDecisionArtifact } from "../types";
import { LocalStorageReadinessSink } from "./localStorageReadinessSink";
import { FirestoreShadowReadinessSink } from "./firestoreShadowReadinessSink";

export class CompositeReadinessSink {
  constructor(
    private readonly deps: {
      local: LocalStorageReadinessSink;
      firestore?: FirestoreShadowReadinessSink;
      enableFirestoreShadow: boolean;
    }
  ) {}

  async write(artifact: ReadinessDecisionArtifact): Promise<void> {
    try {
      this.deps.local.write(artifact);
      if (this.deps.enableFirestoreShadow && this.deps.firestore) {
        await this.deps.firestore.write(artifact);
      }
    } catch {
      // swallow
    }
  }
}
