
import { dataService } from "./dataService";
import { ZapsLedgerEntry } from "../types/walletTypes";
import { energyLedger } from "./zapsLedger/energyLedger";

const ATTRIBUTION_KEY = 'wizup_zaps_attribution_v1';

export const zapsWalletService = {
  
  getAttribution(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || '{}');
    } catch {
      return {};
    }
  },

  getBalance(userId: string): number {
    const user = dataService.getCurrentUser();
    return user?.id === userId ? user.walletBalance : 0;
  },

  getHistory(userId: string): ZapsLedgerEntry[] {
    return dataService.getZapsLedger(userId);
  },

  /**
   * Track where ZAPS were earned (Legacy attribution).
   */
  async attributeEarning(communityId: string, amount: number) {
    const attr = this.getAttribution();
    attr[communityId] = (attr[communityId] || 0) + amount;
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attr));
  },

  /**
   * RE-WIRED: Now uses the Energy Ledger for immediate transfers.
   */
  async sendZaps(fromId: string, toId: string, amount: number, note?: string, communityId: string = 'PLATFORM') {
    // 1. Execute via Energy Ledger (Handles state mutation and Recognition signals)
    await energyLedger.executeAction({
      userId: fromId,
      communityId,
      type: 'SPEND',
      intent: 'TIP',
      amount,
      counterpartyId: toId
    });

    // 2. Update Legacy Ledger for UI compatibility
    const timestamp = Date.now();
    dataService.addZapsEntry({
      id: crypto.randomUUID(),
      userId: fromId,
      type: "SEND",
      amount: -amount,
      counterpartyId: toId,
      description: note || `Sent to user ${toId}`,
      createdAt: timestamp,
    });

    dataService.addZapsEntry({
      id: crypto.randomUUID(),
      userId: toId,
      type: "RECEIVE",
      amount: amount,
      counterpartyId: fromId,
      description: note || `Received from user ${fromId}`,
      createdAt: timestamp,
    });

    this.attributeEarning(communityId, amount);
  },

  async earnZaps(userId: string, amount: number, communityId: string, description: string) {
    // 1. Execute via Energy Ledger
    await energyLedger.executeAction({
      userId,
      communityId,
      type: 'RECEIVE',
      intent: 'J2E_REWARD',
      amount
    });

    // 2. Legacy Update
    dataService.addZapsEntry({
      id: crypto.randomUUID(),
      userId,
      type: "EARN",
      amount: amount,
      referenceId: communityId,
      description: description,
      createdAt: Date.now(),
    });
    this.attributeEarning(communityId, amount);
  }
};
