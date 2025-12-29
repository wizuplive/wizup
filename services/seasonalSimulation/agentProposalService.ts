
import { parameterAnalysisService } from "./parameterAnalysisService";
import { ProposalDomain } from "../../types/proposalFrameworkTypes";

/**
 * 🧠 AGENT PROPOSAL ORCHESTRATOR
 * ===============================
 * Governs the rate and cadence of machine thoughts.
 */

export const agentProposalService = {
  
  /**
   * Triggered by seasonal heartbeats or specific diagnostic signals.
   */
  async runAnalystCycle() {
    console.log("[AGENT] Starting analyst cycle...");
    
    const domains: ProposalDomain[] = [
      'REPUTATION_WEIGHTS',
      'ZAPS_CURVES',
      'DECAY_WINDOWS',
      'GOV_FRESHNESS'
    ];

    for (const domain of domains) {
      // Epistemic isolation: generate one domain at a time
      await parameterAnalysisService.generateProposal(domain);
      
      // Delay to simulate computation and prevent aggressive clustering
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("[AGENT] Analyst cycle complete.");
  },

  /**
   * Archives a proposal. 
   * COMPLIANCE: Humans can ignore/archive; agents do not learn from this.
   */
  archiveProposal(id: string) {
    const proposals = parameterAnalysisService.getProposals();
    const updated = proposals.filter(p => p.id !== id);
    localStorage.setItem("wizup_agent_proposals_v4", JSON.stringify(updated));
    console.log(`[AGENT] Proposal archived: ${id}`);
  }
};
