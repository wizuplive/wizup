import { Season2ViolationArtifact, Season2ViolationCode } from "../types";
import { LS_VIOLATION_INDEX, FS_S2_ACTIVATION_COLLECTIONS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export const violationEmitter = {
  async emit(seasonId: string, code: Season2ViolationCode, details: Record<string, unknown>): Promise<void> {
    const id = `v_act_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const artifact: Season2ViolationArtifact = {
      id,
      seasonId,
      code,
      occurredAtMs: Date.now(),
      details
    };

    try {
      // 1. Local storage
      localStorage.setItem(`wizup:season2:violations:v1:${id}`, JSON.stringify(artifact));
      
      const rawIndex = localStorage.getItem(LS_VIOLATION_INDEX);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      index.unshift(id);
      localStorage.setItem(LS_VIOLATION_INDEX, JSON.stringify(index.slice(0, 100)));

      // 2. Cloud shadow
      if (db) {
        await setDoc(doc(db, FS_S2_ACTIVATION_COLLECTIONS.VIOLATIONS, id), artifact);
      }
      
      console.warn(`%c[ACTIVATION_VIOLATION] ${code} in ${seasonId}`, "color: white; background: #e11d48; font-weight: bold; padding: 2px 4px;");
    } catch (e) {
      // fail-open
    }
  }
};
