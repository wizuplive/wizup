import { SeasonAuditSummaryArtifact } from "../season1Verification/audit/types";
import { ReadinessDecisionArtifact, ReadinessFlags } from "./types";
import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * 🏺 READINESS PERSISTENCE LAYER
 */

const LS_KEYS = {
  READINESS: (id: string) => `WIZUP::S1::READINESS_DECISION::v1::${id}`,
  AUDIT: (id: string) => `wizup:season1:audit_summaries:v1::${id}`,
};

const FS_COLLECTIONS = {
  READINESS: "season1_readiness_decisions_v1",
  AUDIT: "zaps_season1_audit_summaries",
};

export const readinessPersistence = {
  async writeAuditSummary(summary: SeasonAuditSummaryArtifact, flags: ReadinessFlags) {
    if (flags.WRITE_S1_READINESS_LOCAL) {
      localStorage.setItem(LS_KEYS.AUDIT(summary.seasonId), JSON.stringify(summary));
    }

    if (flags.WRITE_S1_READINESS_FIRESTORE && db) {
      const ref = doc(db, FS_COLLECTIONS.AUDIT, summary.seasonId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, summary);
      }
    }
  },

  async writeReadinessDecision(decision: ReadinessDecisionArtifact, flags: ReadinessFlags) {
    if (flags.WRITE_S1_READINESS_LOCAL) {
      localStorage.setItem(LS_KEYS.READINESS(decision.seasonId), JSON.stringify(decision));
    }

    if (flags.WRITE_S1_READINESS_FIRESTORE && db) {
      const ref = doc(db, FS_COLLECTIONS.READINESS, decision.seasonId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, decision);
      }
    }
  },

  getReadinessDecision(seasonId: string): ReadinessDecisionArtifact | null {
    const raw = localStorage.getItem(LS_KEYS.READINESS(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  getAuditSummary(seasonId: string): SeasonAuditSummaryArtifact | null {
    const raw = localStorage.getItem(LS_KEYS.AUDIT(seasonId));
    return raw ? JSON.parse(raw) : null;
  }
};
