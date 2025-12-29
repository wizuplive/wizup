import { Season2CandidateContract, ArchitectAcknowledgement } from "../types";
import { S2_CANDIDATE_KEY, S2_READY_KEY, S2_ACK_KEY, S2_INDEX_KEY, FS_S2_COLLECTIONS } from "../keys";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { violationEmitter } from "../../season2Activation/persistence/violationEmitter";
import { requireS2WriteAllowedOrNoop } from "../../season2TemporalLock/requireS2WriteAllowedOrNoop";
import { verifySeason2RuntimeOrLatch } from "../../season2Integrity/season2RuntimeTripwire";
import { localStorageSinks } from "../../season2Activation/persistence/localStorageSinks";

export const contractSinks = {
  async writeCandidate(contract: Season2CandidateContract): Promise<void> {
    // --- 🔒 RUNTIME INTEGRITY TRIPWIRE ---
    const receipt = localStorageSinks.readReceipt(contract.seasonId);
    if (receipt) {
      const tripwire = await verifySeason2RuntimeOrLatch({
        seasonId: contract.seasonId,
        sealedContractSealHash: receipt.sealedContractSealHash,
        context: { entryPoint: "writeCandidate", communityId: "platform" }
      });
      if (!tripwire.ok) return;
    }

    const gate = await requireS2WriteAllowedOrNoop({
      seasonId: contract.seasonId,
      nowMs: Date.now(),
      action: "WRITE_CANDIDATE",
      noop: null
    });
    if (!gate.allowed) return;

    const key = S2_CANDIDATE_KEY(contract.seasonId);
    const existing = localStorage.getItem(key);

    if (existing) {
      const parsed = JSON.parse(existing) as Season2CandidateContract;
      if (parsed.hashes.contractHash !== contract.hashes.contractHash) {
        // fix: Prefixed violation code with S2_
        await violationEmitter.emit(contract.seasonId, "S2_IMMUTABILITY_VIOLATION", { 
          object: "CANDIDATE", 
          existingHash: parsed.hashes.contractHash,
          proposedHash: contract.hashes.contractHash
        });
        return;
      }
      return; // Idempotent
    }

    localStorage.setItem(key, JSON.stringify(contract));
    this.updateIndex(contract.seasonId);

    if (db) {
      await setDoc(doc(db, FS_S2_COLLECTIONS.CANDIDATES, contract.seasonId), contract, { merge: true });
    }
  },

  async writeReady(contract: Season2CandidateContract): Promise<void> {
    // --- 🔒 RUNTIME INTEGRITY TRIPWIRE ---
    const receipt = localStorageSinks.readReceipt(contract.seasonId);
    if (receipt) {
      const tripwire = await verifySeason2RuntimeOrLatch({
        seasonId: contract.seasonId,
        sealedContractSealHash: receipt.sealedContractSealHash,
        context: { entryPoint: "writeReady", communityId: "platform" }
      });
      if (!tripwire.ok) return;
    }

    const gate = await requireS2WriteAllowedOrNoop({
      seasonId: contract.seasonId,
      nowMs: Date.now(),
      action: "WRITE_READY_CONTRACT",
      noop: null
    });
    if (!gate.allowed) return;

    const key = S2_READY_KEY(contract.seasonId);
    const existing = localStorage.getItem(key);

    if (existing) {
      const parsed = JSON.parse(existing) as Season2CandidateContract;
      if (parsed.hashes.contractHash !== contract.hashes.contractHash) {
        // fix: Prefixed violation code with S2_
        await violationEmitter.emit(contract.seasonId, "S2_IMMUTABILITY_VIOLATION", { 
          object: "READY_CONTRACT", 
          existingHash: parsed.hashes.contractHash 
        });
        return;
      }
      return;
    }

    localStorage.setItem(key, JSON.stringify(contract));

    if (db) {
      await setDoc(doc(db, FS_S2_COLLECTIONS.READY, contract.seasonId), contract, { merge: true });
    }
  },

  async writeAcknowledgement(ack: ArchitectAcknowledgement): Promise<void> {
    // --- 🔒 RUNTIME INTEGRITY TRIPWIRE ---
    const receipt = localStorageSinks.readReceipt(ack.seasonId);
    if (receipt) {
      const tripwire = await verifySeason2RuntimeOrLatch({
        seasonId: ack.seasonId,
        sealedContractSealHash: receipt.sealedContractSealHash,
        context: { entryPoint: "writeAcknowledgement", communityId: "platform" }
      });
      if (!tripwire.ok) return;
    }

    const gate = await requireS2WriteAllowedOrNoop({
      seasonId: ack.seasonId,
      nowMs: Date.now(),
      action: "WRITE_ARCHITECT_ACK",
      noop: null
    });
    if (!gate.allowed) return;

    const key = S2_ACK_KEY(ack.seasonId);
    if (localStorage.getItem(key)) return;

    localStorage.setItem(key, JSON.stringify(ack));

    if (db) {
      await setDoc(doc(db, FS_S2_COLLECTIONS.ACKS, ack.seasonId), ack, { merge: true });
    }
  },

  updateIndex(seasonId: string) {
    const key = S2_INDEX_KEY();
    const raw = localStorage.getItem(key);
    const index: string[] = raw ? JSON.parse(raw) : [];
    if (!index.includes(seasonId)) {
      index.unshift(seasonId);
      localStorage.setItem(key, JSON.stringify(index.slice(0, 50)));
    }
  },

  readCandidate(seasonId: string): Season2CandidateContract | null {
    const raw = localStorage.getItem(S2_CANDIDATE_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  readReady(seasonId: string): Season2CandidateContract | null {
    const raw = localStorage.getItem(S2_READY_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  readAck(seasonId: string): ArchitectAcknowledgement | null {
    const raw = localStorage.getItem(S2_ACK_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  }
};
