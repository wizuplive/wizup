import { ParityReport } from "./types";
import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

const LS_KEY_PREFIX = "WIZUP::PARITY_REPORT::v1::";
const FS_COLLECTION = "zaps_parity_reports_v1";

/**
 * 🏺 PARITY REPORT PERSISTENCE
 */
export const parityPersistence = {
  async writeOnce(report: ParityReport): Promise<boolean> {
    const key = `${LS_KEY_PREFIX}${report.seasonId}`;
    const existingRaw = localStorage.getItem(key);

    if (existingRaw) {
      const existing = JSON.parse(existingRaw) as ParityReport;
      // If hashes match, it's an idempotent ignore
      if (existing.hashes.reportHash === report.hashes.reportHash) {
        return true;
      }
      
      // If different, it's a protocol violation: refuting rewrite of sealed audit history
      await violationEmitter.emit(report.seasonId, "S2_IMMUTABILITY_VIOLATION" as any, {
        object: "PARITY_REPORT",
        stored: existing.hashes.reportHash,
        proposed: report.hashes.reportHash
      });
      return false;
    }

    // 1. Local Write
    localStorage.setItem(key, JSON.stringify(report));

    // 2. Firestore Shadow Write
    if (db) {
      try {
        const ref = doc(db, FS_COLLECTION, report.seasonId);
        await setDoc(ref, report, { merge: true });
      } catch {
        // fail-open
      }
    }

    return true;
  },

  read(seasonId: string): ParityReport | null {
    const raw = localStorage.getItem(`${LS_KEY_PREFIX}${seasonId}`);
    return raw ? JSON.parse(raw) : null;
  }
};
