import { Season2TemporalLockProof, Season2NoopLatch } from "../types";
import { Season2FreezeProof } from "../../season2FreezeProof/types";
import { S2_TEMPORAL_PROOF_KEY, S2_FREEZE_PROOF_KEY, S2_NOOP_LATCH_KEY, FS_S2_ENFORCEMENT_COLLECTIONS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export const proofSinks = {
  async writeTemporalProof(proof: Season2TemporalLockProof): Promise<boolean> {
    const key = S2_TEMPORAL_PROOF_KEY(proof.seasonId);
    if (localStorage.getItem(key)) return true; // write-once

    localStorage.setItem(key, JSON.stringify(proof));
    if (db) {
      await setDoc(doc(db, FS_S2_ENFORCEMENT_COLLECTIONS.TEMPORAL_PROOFS, proof.seasonId), proof, { merge: true });
    }
    return true;
  },

  async writeFreezeProof(proof: Season2FreezeProof): Promise<boolean> {
    const key = S2_FREEZE_PROOF_KEY(proof.seasonId);
    if (localStorage.getItem(key)) return true; // write-once

    localStorage.setItem(key, JSON.stringify(proof));
    if (db) {
      await setDoc(doc(db, FS_S2_ENFORCEMENT_COLLECTIONS.FREEZE_PROOFS, proof.seasonId), proof, { merge: true });
    }
    return true;
  },

  async writeNoopLatch(latch: Season2NoopLatch, seasonId: string): Promise<void> {
    const key = S2_NOOP_LATCH_KEY(seasonId);
    if (localStorage.getItem(key)) return; // keep first latch

    localStorage.setItem(key, JSON.stringify(latch));
    if (db) {
      await setDoc(doc(db, FS_S2_ENFORCEMENT_COLLECTIONS.NOOP_LATCHES, seasonId), latch, { merge: true });
    }
  },

  readTemporalProof(seasonId: string): Season2TemporalLockProof | null {
    const raw = localStorage.getItem(S2_TEMPORAL_PROOF_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  readFreezeProof(seasonId: string): Season2FreezeProof | null {
    const raw = localStorage.getItem(S2_FREEZE_PROOF_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  readNoopLatch(seasonId: string): Season2NoopLatch | null {
    const raw = localStorage.getItem(S2_NOOP_LATCH_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  }
};
