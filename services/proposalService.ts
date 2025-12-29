import { Proposal } from "../types/governanceTypes";
import { dataService } from "./dataService";
import { zapsSignalEmitter } from "./zapsSignals/zapsSignalEmitter";
import { seasonalAllocationSimulation } from "./seasonalSimulation/seasonalAllocationSimulation";

const STORAGE_KEY = 'wizup_proposals_v1';

export const proposalService = {
  
  async createProposal(input: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'closesAt'>): Promise<Proposal> {
    const now = Date.now();
    const proposal: Proposal = {
      ...input,
      id: `prop_${crypto.randomUUID()}`,
      status: 'OPEN',
      createdAt: now,
      closesAt: now + (7 * 24 * 60 * 60 * 1000)
    };

    const existing = await this.listProposals(proposal.communityId);
    existing.unshift(proposal);
    this.saveToStorage(proposal.communityId, existing);
    
    // 7.6 Governance Proposal Signal Emission
    zapsSignalEmitter.emit({
      type: 'GOVERNANCE_PROPOSAL',
      actorUserId: proposal.createdBy,
      communityId: proposal.communityId,
      source: 'GOVERNANCE',
      metadata: { proposalId: proposal.id }
    });

    seasonalAllocationSimulation.recomputeCommunity(proposal.communityId);

    dataService.shadowWriteProposal?.(proposal.communityId, proposal);
    return proposal;
  },

  async listProposals(communityId: string): Promise<Proposal[]> {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${communityId}`);
    return raw ? JSON.parse(raw) : [];
  },

  async getProposal(communityId: string, id: string): Promise<Proposal | undefined> {
    const all = await this.listProposals(communityId);
    return all.find(p => p.id === id);
  },

  async closeProposal(communityId: string, id: string) {
    const all = await this.listProposals(communityId);
    const idx = all.findIndex(p => p.id === id);
    if (idx >= 0) {
      all[idx].status = 'CLOSED';
      this.saveToStorage(communityId, all);
    }
  },

  saveToStorage(communityId: string, proposals: Proposal[]) {
    localStorage.setItem(`${STORAGE_KEY}:${communityId}`, JSON.stringify(proposals));
  }
};
