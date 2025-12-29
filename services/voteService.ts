import { Vote, Proposal } from "../types/governanceTypes";
import { governanceWeightService } from "./governanceWeightService";
import { dataService } from "./dataService";
import { reputationService } from "./reputationService";
import { zapsSignalEmitter } from "./zapsSignals/zapsSignalEmitter";
import { seasonalAllocationSimulation } from "./seasonalSimulation/seasonalAllocationSimulation";

const STORAGE_KEY = 'wizup_votes_v1';
const ALL_VOTES_KEY = 'wizup_votes_v1_all';
const QUORUM_THRESHOLD = 0.20;

export const voteService = {

  async castVote(proposal: Proposal, userId: string, choice: "YES" | "NO") {
    if (proposal.status !== 'OPEN') throw new Error("Proposal is not active");

    const profile = await governanceWeightService.computeProfile(proposal.communityId, userId);
    if (profile.computedWeight <= 0) throw new Error("No governance weight in this community");

    const vote: Vote = {
      proposalId: proposal.id,
      userId,
      choice,
      weightAtCast: profile.computedWeight,
      castAt: Date.now()
    };

    const existing = await this.getVotesForProposal(proposal.id);
    const filtered = existing.filter(v => v.userId !== userId);
    filtered.push(vote);
    localStorage.setItem(`${STORAGE_KEY}:${proposal.id}`, JSON.stringify(filtered));

    const allVotes = JSON.parse(localStorage.getItem(ALL_VOTES_KEY) || '[]');
    const allFiltered = allVotes.filter((v: any) => !(v.userId === userId && v.proposalId === proposal.id));
    allFiltered.push({ ...vote, communityId: proposal.communityId });
    localStorage.setItem(ALL_VOTES_KEY, JSON.stringify(allFiltered));
    
    reputationService.emit({
        actorId: userId,
        communityId: proposal.communityId,
        signalType: 'STEWARDSHIP'
    });

    // 7.5 Governance Vote Signal Emission
    zapsSignalEmitter.emit({
      type: 'GOVERNANCE_VOTE',
      actorUserId: userId,
      communityId: proposal.communityId,
      source: 'GOVERNANCE',
      metadata: { proposalId: proposal.id }
    });

    seasonalAllocationSimulation.recomputeCommunity(proposal.communityId);

    dataService.shadowWriteVote?.(proposal.communityId, vote);
  },

  async getVotesForProposal(proposalId: string): Promise<Vote[]> {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${proposalId}`);
    return raw ? JSON.parse(raw) : [];
  },

  async tally(proposal: Proposal, activeTotalWeight: number) {
    const votes = await this.getVotesForProposal(proposal.id);
    
    let yesWeight = 0;
    let noWeight = 0;
    
    votes.forEach(v => {
      if (v.choice === 'YES') yesWeight += v.weightAtCast;
      else noWeight += v.weightAtCast;
    });

    const totalVotedWeight = yesWeight + noWeight;
    const hasQuorum = activeTotalWeight > 0 && (totalVotedWeight / activeTotalWeight) >= QUORUM_THRESHOLD;
    const passed = hasQuorum && yesWeight > noWeight;

    return {
      passed,
      hasQuorum,
      yesWeight,
      noWeight,
      participationRate: activeTotalWeight > 0 ? totalVotedWeight / activeTotalWeight : 0
    };
  }
};
