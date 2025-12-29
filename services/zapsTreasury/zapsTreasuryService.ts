import { treasuryStore } from "./treasuryStore";
import { TreasuryAction, TreasuryActionType, TreasuryProposal } from "./types";
import { SpendIntentCategory } from "../zapsSpend/types";
import { driftLogService } from "../driftLogService";
import { featureFlags } from "../../config/featureFlags";
import { freezeProtocol } from "./freezeProtocol";
import { treasuryRuleset, TREASURY_RULESET_V1 } from "./ruleset";
import { authorizationService } from "./authorizationService";

export const zapsTreasuryService = {
  
  /**
   * Primary Funding Entry Point (Strictly Validated)
   */
  async fundTreasury(communityId: string, amount: number, type: TreasuryActionType, description: string) {
    if (!featureFlags.ZAPS_TREASURY_V1) return;

    // 1. Validate Source
    if (!treasuryRuleset.isValidFunding(type)) {
      console.warn(`[TREASURY] Funding rejected: Invalid source type ${type}`);
      return;
    }

    const summary = treasuryStore.getSummary(communityId);
    const action: TreasuryAction = {
      id: crypto.randomUUID(),
      communityId,
      type,
      amount,
      description,
      actorId: 'SYSTEM',
      timestamp: Date.now(),
      hash: ''
    };
    action.hash = driftLogService.hash(action);

    summary.balance += amount;
    summary.lastActionAt = action.timestamp;

    treasuryStore.appendAction(action);
    treasuryStore.saveSummary(summary);
    
    console.log(`%c[TREASURY] Funded ${communityId}: +${amount} ZAPS (${type})`, "color: #10b981; font-weight: bold;");
  },

  /**
   * Create a Spend Proposal.
   * Authority required to propose.
   */
  async proposeDistribution(args: {
    userId: string;
    communityId: string;
    category: SpendIntentCategory;
    amount: number;
    description: string;
  }): Promise<{ success: boolean; proposalId?: string; error?: string }> {
    const isAuth = await authorizationService.isAuthorizedToPropose(args.userId, args.communityId);
    if (!isAuth) return { success: false, error: "Insufficient authority to propose." };

    if (!treasuryRuleset.isValidSpend(args.category)) return { success: false, error: "Invalid spend category." };

    const proposal: TreasuryProposal = {
      id: `prop_${crypto.randomUUID()}`,
      communityId: args.communityId,
      proposerId: args.userId,
      category: args.category,
      amount: args.amount,
      description: args.description,
      approvals: [args.userId], // Auto-approve by proposer
      status: 'PENDING',
      createdAt: Date.now(),
      expiresAt: Date.now() + TREASURY_RULESET_V1.proposalExpiryMs
    };

    // Store proposal (simulated in-memory/local)
    this.saveProposal(proposal);

    return { success: true, proposalId: proposal.id };
  },

  /**
   * Final Execution of an approved proposal.
   * Enforces Safety Rails at the moment of mutation.
   */
  async executeProposal(proposalId: string, actorId: string): Promise<{ success: boolean; error?: string }> {
    const proposal = this.getProposal(proposalId);
    if (!proposal || proposal.status !== 'PENDING') return { success: false, error: "Proposal not found or inactive." };

    const summary = treasuryStore.getSummary(proposal.communityId);
    if (summary.isFrozen) return { success: false, error: "Treasury is locked." };

    // 1. Quorum Check
    if (!authorizationService.hasQuorum(proposal.approvals, TREASURY_RULESET_V1.minStewardQuorum)) {
      return { success: false, error: "Insufficient approvals (Quorum not met)." };
    }

    // 2. Safety Rail Check (Velocity & Caps)
    const recentOutflow = this.calculateHourlyOutflow(proposal.communityId);
    if (!treasuryRuleset.passesSafetyRails(proposal.amount, summary.balance, recentOutflow)) {
      proposal.status = 'BLOCKED';
      this.saveProposal(proposal);
      return { success: false, error: "Safety Rail Violation: Velocity or Cap exceeded." };
    }

    // 3. Mutate State
    const action: TreasuryAction = {
      id: crypto.randomUUID(),
      communityId: proposal.communityId,
      type: 'DISTRIBUTION',
      category: proposal.category,
      amount: -proposal.amount,
      description: proposal.description,
      actorId: actorId,
      timestamp: Date.now(),
      hash: ''
    };
    action.hash = driftLogService.hash(action);

    summary.balance -= proposal.amount;
    summary.totalDistributed += proposal.amount;
    summary.lastActionAt = action.timestamp;
    
    proposal.status = 'EXECUTED';

    treasuryStore.appendAction(action);
    treasuryStore.saveSummary(summary);
    this.saveProposal(proposal);

    // 4. Post-mutation safety: If outflow hit > 50% threshold, initiate emergency freeze
    if (recentOutflow + proposal.amount > summary.balance * 0.5) {
        await freezeProtocol.initiateFreeze(proposal.communityId, 'SYSTEM', 'Sudden Large Outflow detected.');
    }

    return { success: true };
  },

  /**
   * Internal Helper: Calculate outflow in the velocity window.
   */
  calculateHourlyOutflow(communityId: string): number {
    const windowStart = Date.now() - TREASURY_RULESET_V1.velocityWindowMs;
    const actions = treasuryStore.getLedger(communityId);
    return actions
      .filter(a => a.timestamp > windowStart && a.type === 'DISTRIBUTION')
      .reduce((sum, a) => sum + Math.abs(a.amount), 0);
  },

  // --- PROPOSAL STORAGE SIMULATION ---
  saveProposal(p: TreasuryProposal) {
    const key = `wizup:treasury:proposals:${p.communityId}`;
    const existing: TreasuryProposal[] = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = existing.findIndex(x => x.id === p.id);
    if (idx >= 0) existing[idx] = p; else existing.unshift(p);
    localStorage.setItem(key, JSON.stringify(existing));
  },

  getProposal(id: string): TreasuryProposal | undefined {
    // Search all community proposal buckets
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('wizup:treasury:proposals:')) {
            const props: TreasuryProposal[] = JSON.parse(localStorage.getItem(k) || '[]');
            const p = props.find(x => x.id === id);
            if (p) return p;
        }
    }
    return undefined;
  },

  getSummary(communityId: string) {
    return treasuryStore.getSummary(communityId);
  },

  getRecentActions(communityId: string) {
    return treasuryStore.getLedger(communityId).slice(0, 10);
  }
};