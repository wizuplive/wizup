import { dataService } from "../dataService";
import { zapsWalletService } from "../zapsWalletService";
import { SpendIntentCategory, SpendIntentRecord } from "./types";
import { featureFlags } from "../../config/featureFlags";

const SPEND_LEDGER_KEY = 'wizup_zaps_spend_v1';

export const zapsSpendService = {
  /**
   * Execute a spend transaction bound to a specific participation intent.
   * INVARIANT: No fiat pricing, no withdrawals, one-way participation energy.
   */
  async executeSpend(args: {
    userId: string;
    communityId: string;
    category: SpendIntentCategory;
    amount: number;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; record?: SpendIntentRecord; error?: string }> {
    if (!featureFlags.ZAPS_SPEND_V1) return { success: false, error: "Spend Protocol Offline" };

    try {
      const balance = zapsWalletService.getBalance(args.userId);
      if (balance < args.amount) {
        return { success: false, error: "Insufficient ZAPS for this intent." };
      }

      // 1. Prepare Spend Record (Qualitative History)
      const record: SpendIntentRecord = {
        id: crypto.randomUUID(),
        userId: args.userId,
        communityId: args.communityId,
        category: args.category,
        amount: args.amount,
        description: args.description,
        timestamp: Date.now(),
        metadata: args.metadata
      };

      // 2. Atomic Transaction (Simulated)
      // Note: In v1, the wallet service handles the numeric ledger.
      // We route through sendZaps or REDEEM based on the category.
      const isTip = args.category === 'CONTRIBUTION' && args.metadata?.targetUserId;
      
      if (isTip) {
        await zapsWalletService.sendZaps(
          args.userId, 
          args.metadata?.targetUserId, 
          args.amount, 
          `Recognition: ${args.description}`,
          args.communityId
        );
      } else {
        // Redemptions are one-way (burned or community-treasury bound)
        dataService.addZapsEntry({
          id: `spend_${record.id}`,
          userId: args.userId,
          type: "REDEEM",
          amount: -args.amount,
          referenceId: args.communityId,
          description: args.description,
          createdAt: record.timestamp
        });
      }

      // 3. Persist Intent History (Read-only Context)
      this.saveToLedger(record);

      console.log(`%c[SPEND] Intent Validated: ${args.category} in ${args.communityId}`, "color: #fbbf24; font-weight: bold;");
      return { success: true, record };

    } catch (e) {
      console.error("[ZapsSpend] Transaction failed:", e);
      return { success: false, error: "Protocol Error" };
    }
  },

  getSpendHistory(userId: string): SpendIntentRecord[] {
    try {
      const all: SpendIntentRecord[] = JSON.parse(localStorage.getItem(SPEND_LEDGER_KEY) || '[]');
      return all.filter(r => r.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
    } catch { return []; }
  },

  saveToLedger(record: SpendIntentRecord) {
    const all = JSON.parse(localStorage.getItem(SPEND_LEDGER_KEY) || '[]');
    all.unshift(record);
    if (all.length > 500) all.pop();
    localStorage.setItem(SPEND_LEDGER_KEY, JSON.stringify(all));
  }
};