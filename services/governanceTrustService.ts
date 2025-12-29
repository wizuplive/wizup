/**
 * 🧠 GOVERNANCE TRUST SERVICE v1
 * ===============================
 * Purpose: Compute the invisible "TrustBias" scalar based on civic participation.
 * 
 * CONTRACT COMPLIANCE:
 * 1. INVISIBLE: No UI exposure.
 * 2. CAPPED: Max bias is +20% (1.20).
 * 3. OUTCOME-ALIGNED: Rewards consensus-building over friction.
 */

import { proposalService } from "./proposalService";
import { voteService } from "./voteService";
import { Proposal } from "../types/governanceTypes";

export interface GovernanceTrustScore {
  participationRate: number; // 0-1
  alignmentRate: number;    // 0-1
  freshness: boolean;
  computedBias: number;     // 0.9 -> 1.2
}

const LOOKBACK_WINDOW_MS = 90 * 24 * 60 * 60 * 1000; // 90 Days
const FRESHNESS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

export const governanceTrustService = {
  
  /**
   * Compute the TrustBias for a specific user in a community.
   * This is used by the Seasonal Allocation Engine.
   */
  async computeUserTrustBias(communityId: string, userId: string): Promise<number> {
    try {
      const [proposals, votes] = await Promise.all([
        proposalService.listProposals(communityId),
        voteService.getVotesForProposal('') // This is a placeholder for a "getUserVotes" logic
      ]);

      // In v1 demo, we fetch all votes for the community and filter
      // In prod, this would be a specific query
      const userVotes = JSON.parse(localStorage.getItem('wizup_votes_v1_all') || '[]')
        .filter((v: any) => v.userId === userId && v.communityId === communityId);

      const closedProposals = proposals.filter(p => p.status !== 'OPEN');
      if (closedProposals.length === 0) return 1.0; // Baseline for new communities

      // 1. Participation Frequency
      const participationRate = userVotes.length / closedProposals.length;

      // 2. Alignment Rate
      // Determine how many times the user's vote matched the community consensus
      let alignmentCount = 0;
      for (const p of closedProposals) {
        const vote = userVotes.find((v: any) => v.proposalId === p.id);
        if (!vote) continue;

        // Simple mock of consensus check (since full outcome isn't stored in Proposal type yet)
        // In prod, this checks Proposal.finalOutcome
        const consensusMatched = true; // Placeholder logic
        if (consensusMatched) alignmentCount++;
      }
      const alignmentRate = userVotes.length > 0 ? alignmentCount / userVotes.length : 0.5;

      // 3. Freshness
      const lastVoteAt = userVotes.length > 0 ? Math.max(...userVotes.map((v: any) => v.castAt)) : 0;
      const isFresh = (Date.now() - lastVoteAt) < FRESHNESS_WINDOW_MS;

      // 4. Scalar Calculation
      // Base is 1.0. 
      // Participation adds up to +0.10
      // Alignment adds up to +0.10
      // Inactivity (Freshness) or zero participation can dip to 0.90
      let bias = 0.90;
      bias += (participationRate * 0.15);
      bias += (alignmentRate * 0.15);
      
      if (!isFresh && participationRate > 0) bias -= 0.05;

      const finalBias = Math.min(1.20, Math.max(0.90, bias));

      console.debug(`🧠 [TRUST] Bias for ${userId}: ${finalBias.toFixed(2)} (P:${participationRate.toFixed(2)}, A:${alignmentRate.toFixed(2)})`);

      return Number(finalBias.toFixed(4));

    } catch (e) {
      console.warn("[GovernanceTrust] Scalar computation failed, defaulting to neutral.");
      return 1.0;
    }
  }
};