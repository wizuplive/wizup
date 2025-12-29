import { Season2SealedContract, Season2ActivationReceipt } from "../types";
import { S2_SEALED_KEY, S2_RECEIPT_KEY } from "../keys";
import { violationEmitter } from "./violationEmitter";

export const localStorageSinks = {
  async writeSealedContract(contract: Season2SealedContract): Promise<boolean> {
    const key = S2_SEALED_KEY(contract.seasonId);
    const existing = localStorage.getItem(key);

    if (existing) {
      const parsed = JSON.parse(existing) as Season2SealedContract;
      if (parsed.hashes.sealHash !== contract.hashes.sealHash) {
        await violationEmitter.emit(contract.seasonId, "S2_IMMUTABILITY_VIOLATION", {
          object: "SEALED_CONTRACT",
          existingHash: parsed.hashes.sealHash,
          proposedHash: contract.hashes.sealHash
        });
        return false;
      }
      return true; // Idempotent
    }

    localStorage.setItem(key, JSON.stringify(contract));
    return true;
  },

  async writeReceipt(receipt: Season2ActivationReceipt): Promise<boolean> {
    const key = S2_RECEIPT_KEY(receipt.seasonId);
    const existing = localStorage.getItem(key);

    if (existing) {
      const parsed = JSON.parse(existing) as Season2ActivationReceipt;
      if (parsed.activationHash !== receipt.activationHash) {
        await violationEmitter.emit(receipt.seasonId, "S2_IMMUTABILITY_VIOLATION", {
          object: "ACTIVATION_RECEIPT",
          existingHash: parsed.activationHash,
          proposedHash: receipt.activationHash
        });
        return false;
      }
      return true; // Idempotent
    }

    localStorage.setItem(key, JSON.stringify(receipt));
    return true;
  },

  readSealedContract(seasonId: string): Season2SealedContract | null {
    const raw = localStorage.getItem(S2_SEALED_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  readReceipt(seasonId: string): Season2ActivationReceipt | null {
    const raw = localStorage.getItem(S2_RECEIPT_KEY(seasonId));
    return raw ? JSON.parse(raw) : null;
  }
};
