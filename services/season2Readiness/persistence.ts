import { Season2CandidateContract } from "./types";
import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { season1TemporalLock } from "../season1TemporalLock/season1TemporalLock";

const LS_KEY_PREFIX = "WIZUP::S2::CANDIDATE_CONTRACT::v1::";
const INDEX_KEY = "WIZUP::S2::CANDIDATE_INDEX::v1";
const FS_COLLECTION = "season2_candidate_contracts_v1";

export const candidateSink = {
  async write(contract: Season2CandidateContract): Promise<void> {
    const key = `${LS_KEY_PREFIX}${contract.seasonId}`;
    const existing = localStorage.getItem(key);

    if (existing) {
      const parsed = JSON.parse(existing) as Season2CandidateContract;
      // Irreversible check: only identical hashes or a transition from CANDIDATE -> READY allowed
      if (parsed.hashes.contractHash !== contract.hashes.contractHash) {
        await season1TemporalLock.emitViolation("ARCHIVE_IMMUTABILITY_BREACH", "CRITICAL", 
          { seasonId: contract.seasonId, objectType: "unknown" }, 
          { existingHash: parsed.hashes.contractHash, proposedHash: contract.hashes.contractHash }
        );
        return;
      }
      
      // If existing is already READY, refuse any downgrade/rewrite
      if (parsed.status === "READY" && contract.status === "CANDIDATE") {
        return;
      }
    }

    // Local Write
    localStorage.setItem(key, JSON.stringify(contract));
    this.updateIndex(contract.seasonId);

    // Firestore Shadow
    if (db) {
      try {
        await setDoc(doc(db, FS_COLLECTION, contract.seasonId), contract, { merge: true });
      } catch {}
    }
  },

  read(seasonId: string): Season2CandidateContract | null {
    const raw = localStorage.getItem(`${LS_KEY_PREFIX}${seasonId}`);
    return raw ? JSON.parse(raw) : null;
  },

  updateIndex(seasonId: string) {
    const raw = localStorage.getItem(INDEX_KEY);
    const index: string[] = raw ? JSON.parse(raw) : [];
    if (!index.includes(seasonId)) {
      index.unshift(seasonId);
      localStorage.setItem(INDEX_KEY, JSON.stringify(index.slice(0, 50)));
    }
  }
};
