import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { FIRESTORE_PROTOCOL_CUTOVER_VIOLATION_COLLECTION } from "../keys";
import type { ProtocolCutoverViolationArtifactV1 } from "../types";
import type { ProtocolCutoverViolationSink } from "./violationSink";

export class FirestoreShadowProtocolCutoverViolationSink implements ProtocolCutoverViolationSink {
  async emit(v: ProtocolCutoverViolationArtifactV1): Promise<void> {
    if (!db) return;
    try {
      const ref = doc(db, FIRESTORE_PROTOCOL_CUTOVER_VIOLATION_COLLECTION, v.id);
      await setDoc(ref, v, { merge: true });
    } catch {
      // fail-open
    }
  }
}
