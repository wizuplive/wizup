import { TreasuryAction, TreasurySummary } from "./types";

const SUMMARY_PREFIX = 'wizup:treasury:summary:';
const LEDGER_PREFIX = 'wizup:treasury:ledger:';

export const treasuryStore = {
  getSummary(communityId: string): TreasurySummary {
    try {
      const raw = localStorage.getItem(`${SUMMARY_PREFIX}${communityId}`);
      return raw ? JSON.parse(raw) : {
        communityId,
        balance: 0,
        isFrozen: false,
        totalDistributed: 0,
        lastActionAt: 0
      };
    } catch {
      return { communityId, balance: 0, isFrozen: false, totalDistributed: 0, lastActionAt: 0 };
    }
  },

  saveSummary(summary: TreasurySummary) {
    localStorage.setItem(`${SUMMARY_PREFIX}${summary.communityId}`, JSON.stringify(summary));
  },

  getLedger(communityId: string): TreasuryAction[] {
    try {
      const raw = localStorage.getItem(`${LEDGER_PREFIX}${communityId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  appendAction(action: TreasuryAction) {
    const ledger = this.getLedger(action.communityId);
    ledger.unshift(action);
    if (ledger.length > 500) ledger.pop();
    localStorage.setItem(`${LEDGER_PREFIX}${action.communityId}`, JSON.stringify(ledger));
  }
};