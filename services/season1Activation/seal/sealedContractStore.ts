import { LS_KEYS, FS_COLLECTIONS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

/**
 * 🏺 SEALED CONTRACT STORE
 */

export type SealedContractRecord = {
  schemaVersion: "v1";
  seasonId: string;
  unsealedContractHash: string;
  sealedContractHash: string;
  readinessDecisionHash: string;
  constraintsHash: string;
  resolutionArtifactHash: string;
  sealedAtMs: number;
  sealPayloadForAudit?: unknown;
};

export class SealedContractStore {
  constructor(private readonly storage: Storage = window.localStorage) {}

  read(seasonId: string): SealedContractRecord | null {
    try {
      const raw = this.storage.getItem(LS_KEYS.sealedContract(seasonId));
      return raw ? (JSON.parse(raw) as SealedContractRecord) : null;
    } catch {
      return null;
    }
  }

  writeLocal(record: SealedContractRecord): void {
    try {
      this.storage.setItem(LS_KEYS.sealedContract(record.seasonId), JSON.stringify(record));
    } catch {
      // swallow
    }
  }

  async writeFirestore(record: SealedContractRecord): Promise<void> {
    try {
      if (!db) return;
      const ref = doc(db, FS_COLLECTIONS.sealedContracts, record.seasonId);
      await setDoc(ref, record, { merge: true });
    } catch {
      // swallow
    }
  }
}
