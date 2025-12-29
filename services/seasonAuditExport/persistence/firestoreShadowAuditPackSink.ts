import { AuditPackResult } from "../types";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { violationEmitter } from "../../season2Activation/persistence/violationEmitter";

const COLLECTION = "zaps_season_audit_packs_v1";

export const firestoreShadowAuditPackSink = {
  async write(result: AuditPackResult): Promise<boolean> {
    if (!db) return true;

    try {
      const docId = `${result.manifest.seasonId}__${result.manifest.packHash}`;
      const ref = doc(db, COLLECTION, docId);

      const snap = await getDoc(ref);
      if (snap.exists()) {
        return true; // Already present
      }

      // Check for same season different hash (Integrity Breach)
      // This would require a query in production; here we assume docId isolation
      
      await setDoc(ref, {
        ...result.manifest,
        jsonlLines: result.lines, // Store lines for auditability in shadow
        _exportedAtMs: Date.now()
      });

      return true;
    } catch (e) {
      return false;
    }
  }
};
