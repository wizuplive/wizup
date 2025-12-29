/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { Season1ActivationContract } from "../../season1Activation/types";

const KEY_PREFIX = "WIZUP::S1::SEALED_CONTRACT::v1::";

export const contractSealSink = {
  async write(contract: Season1ActivationContract): Promise<void> {
    try {
      const key = `${KEY_PREFIX}${contract.seasonId}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, JSON.stringify(contract));
    } catch {
      // Swallow
    }
  },

  async read(seasonId: string): Promise<Season1ActivationContract | null> {
    try {
      const raw = localStorage.getItem(`${KEY_PREFIX}${seasonId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
