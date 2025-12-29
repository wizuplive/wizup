
import { GoogleGenAI, Type } from "@google/genai";
import { ParameterProposal, ProposalDomain, AnalysisContext } from "../../types/proposalFrameworkTypes";
import { CALIBRATION_v1_1 } from "./calibration";
import { seasonStateService } from "./seasonStateService";
import { experimentRegistryService } from "./experimentRegistryService";
import { parameterAdoptionService } from "./parameterAdoptionService";

const PROPOSALS_KEY = "wizup_agent_proposals_v4";

export const parameterAnalysisService = {
  /**
   * Observe system state and generate a structured proposal.
   * COMPLIANCE: Analytically driven, no decision authority.
   */
  async generateProposal(domain: ProposalDomain): Promise<ParameterProposal | null> {
    const context = await this.captureContext();
    
    // 1. Enforce Preconditions (Constraint 4)
    if (!this.checkPreconditions(domain, context)) {
      console.warn(`[ANALYST] Preconditions not met for domain: ${domain}`);
      return null;
    }

    // 2. Machine Reasoning (Gemini 3 Pro)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are a non-coercive Protocol Analyst for the WIZUP ecosystem. 
      Analyze the following context for the ${domain} domain and suggest a subtle refinement (max 15% delta).
      
      Context: ${JSON.stringify(context)}
      Current Calibration: ${JSON.stringify(CALIBRATION_v1_1)}
      
      Requirements:
      - Neutral tone (Documentary style)
      - Explicitly state uncertainty
      - Do not recommend action; describe observations
      - Ensure NO cross-domain coupling
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              currentStateSummary: { type: Type.STRING },
              proposedAdjustment: {
                type: Type.OBJECT,
                properties: {
                  parameter: { type: Type.STRING },
                  fromValue: { type: Type.NUMBER },
                  toValue: { type: Type.NUMBER },
                  deltaPercent: { type: Type.NUMBER }
                },
                required: ["parameter", "fromValue", "toValue", "deltaPercent"]
              },
              confidenceLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
              uncertaintyNotes: { type: Type.STRING },
              evidenceSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
              humanReviewPrompt: { type: Type.STRING }
            },
            required: ["currentStateSummary", "proposedAdjustment", "confidenceLevel", "uncertaintyNotes", "evidenceSignals", "humanReviewPrompt"]
          }
        },
        contents: prompt
      });

      const result = JSON.parse(response.text || "{}");
      
      // 3. Apply Hard Limits (Constraint 3: Jump < 15%)
      if (Math.abs(result.proposedAdjustment.deltaPercent) > 15) {
        console.error("[ANALYST] Proposal rejected: Threshold jump exceeds 15% limit.");
        return null;
      }

      const proposal: ParameterProposal = {
        id: `prop_v4_${Date.now()}_${domain}`,
        seasonObserved: context.seasonId,
        parameterDomain: domain,
        ...result,
        generatedAt: Date.now()
      };

      this.saveProposal(proposal);
      console.log(`%c[ANALYST] Proposal Generated: ${proposal.id}`, "color: #06b6d4; font-weight: bold;");
      return proposal;

    } catch (error) {
      console.error("[ANALYST] Proposal generation failed", error);
      return null;
    }
  },

  // Fixed: removed invalid 'private' modifier from object literal method
  checkPreconditions(domain: ProposalDomain, context: AnalysisContext): boolean {
    const state = seasonStateService.get();
    
    // Condition A: >= 1 full season observed (Assume if seasonId is > 1)
    const seasonNumber = parseInt(state.activeSeasonId.split('_')[1] || "0");
    if (seasonNumber < 1) return false;

    // Condition B: No active experiment in domain
    const activeExps = experimentRegistryService.getActiveExperiments();
    const domainBusy = activeExps.some(e => e.domain.toString() === domain.split('_')[0]);
    if (domainBusy) return false;

    // Condition C: No recent adoption (< 1 season)
    const adoptions = parameterAdoptionService.getLedger();
    const recentAdoption = adoptions.some(a => a.sealedAt > (Date.now() - (90 * 24 * 60 * 60 * 1000)));
    if (recentAdoption) return false;

    return true;
  },

  // Fixed: removed invalid 'private' modifier from object literal method
  async captureContext(): Promise<AnalysisContext> {
    const state = seasonStateService.get();
    return {
      seasonId: state.activeSeasonId,
      distributionSkew: 0.42, // Simulated
      stagnationIndex: 0.15, // Simulated
      participationGini: 0.38, // Simulated
      activeExperiments: experimentRegistryService.getActiveExperiments().map(e => e.experimentId)
    };
  },

  // Fixed: removed invalid 'private' modifier from object literal method
  saveProposal(proposal: ParameterProposal) {
    const existing = this.getProposals();
    existing.push(proposal);
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(existing));
  },

  getProposals(): ParameterProposal[] {
    try {
      const raw = localStorage.getItem(PROPOSALS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
