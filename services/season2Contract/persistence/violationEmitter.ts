import { Season2ViolationArtifact, Season2ViolationCode } from "../types";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const LS_VIOLATION_INDEX = "wizup:season2:violations:index:v1";

export const violationEmitter = {
  async emit(seasonId: string, code: Season2ViolationCode, details: Record<string, unknown>): Promise<void> {
    const id = `v_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const artifact: Season2ViolationArtifact = {
      id,
      seasonId,
      code,
      occurredAtMs: Date.now(),
      details
    };

    try {
      // 1. Local Persistence
      localStorage.setItem(`wizup:season2:violations:v1:${id}`, JSON.stringify(artifact));
      
      const rawIndex = localStorage.getItem(LS_VIOLATION_INDEX);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      index.unshift(id);
      localStorage.setItem(LS_VIOLATION_INDEX, JSON.stringify(index.slice(0, 100)));

      // 2. Cloud Shadow
      if (db) {
        await setDoc(doc(db, "zaps_season2_violation_artifacts", id), artifact);
      }

      console.error(`%c[PROTOCOL_VIOLATION] ${code} in ${seasonId}`, "color: white; background: red; font-weight: bold;");
    } catch (e) {
      // fail-open
    }
  }
};
