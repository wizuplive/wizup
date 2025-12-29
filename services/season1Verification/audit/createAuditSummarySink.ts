import { LocalStorageAuditSummarySink } from "./sinks/localStorageAuditSummarySink";
import { FirestoreShadowAuditSummarySink } from "./sinks/firestoreShadowAuditSummarySink";
import { CompositeAuditSummarySink } from "./sinks/compositeAuditSummarySink";

export type Season1AuditSinkFlags = {
  WRITE_S1_AUDIT_LOCAL: boolean;
  WRITE_S1_AUDIT_FIRESTORE: boolean;
};

export function createSeason1AuditSummarySink(flags: () => Season1AuditSinkFlags) {
  const f = flags();
  const local = new LocalStorageAuditSummarySink();

  return new CompositeAuditSummarySink({
    local,
    firestore: f.WRITE_S1_AUDIT_FIRESTORE ? new FirestoreShadowAuditSummarySink() : undefined,
    enableFirestoreShadow: Boolean(f.WRITE_S1_AUDIT_FIRESTORE),
  });
}