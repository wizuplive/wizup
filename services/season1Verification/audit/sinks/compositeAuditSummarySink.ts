import { SeasonAuditSummaryArtifact } from "../types";
import { LocalStorageAuditSummarySink } from "./localStorageAuditSummarySink";
import { FirestoreShadowAuditSummarySink } from "./firestoreShadowAuditSummarySink";

export class CompositeAuditSummarySink {
  constructor(
    private readonly deps: {
      local: LocalStorageAuditSummarySink;
      firestore?: FirestoreShadowAuditSummarySink;
      enableFirestoreShadow: boolean;
    }
  ) {}

  async write(summary: SeasonAuditSummaryArtifact): Promise<void> {
    try {
      this.deps.local.write(summary);
      if (this.deps.enableFirestoreShadow && this.deps.firestore) {
        await this.deps.firestore.write(summary);
      }
    } catch {
      // swallow
    }
  }
}