import { SeasonAuditSummaryArtifact } from "../types";
import { FS_AUDIT_COLLECTIONS, FS_AUDIT_DOC_IDS } from "../keys";
import { db } from "../../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export class FirestoreShadowAuditSummarySink {
  async write(summary: SeasonAuditSummaryArtifact): Promise<void> {
    try {
      if (!db) return;
      const docRef = doc(db, FS_AUDIT_COLLECTIONS.auditSummaries, FS_AUDIT_DOC_IDS.summaryDoc(summary.seasonId));
      await setDoc(docRef, summary, { merge: true });
    } catch {
      // swallow (fail-open)
    }
  }
}