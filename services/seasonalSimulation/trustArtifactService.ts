
import { GoogleGenAI, Type } from "@google/genai";
import { CommunityTrustState, SeasonCloseSummary } from "../../types/legibilityTypes";
import { seasonStateService } from "./seasonStateService";
import { canonRegistryService } from "./canonRegistryService";
import { suspensionService } from "./suspensionService";

/**
 * 🤝 TRUST ARTIFACT SERVICE
 * =========================
 * Generates the legibility surfaces for the community.
 * Tone: Institutional, calm, factual. No numbers.
 */

export const trustArtifactService = {

  async generateTrustState(communityId: string): Promise<CommunityTrustState> {
    const state = seasonStateService.get();
    const lastCanon = canonRegistryService.getLedger()
      .filter(c => c.parameterKey.includes('Weights'))
      .sort((a, b) => b.effectiveDate - a.effectiveDate)[0];
    
    const activeSuspensions = suspensionService.getLedger()
      .filter(s => s.status === 'ACTIVE' && (s.scope.type === 'GLOBAL' || (s.scope.type === 'COMMUNITY' && s.scope.communityId === communityId)));

    return {
      communityId,
      currentSeasonLabel: `${state.activeSeasonId.replace('_', ' ')}: ${state.mode}`,
      governanceStatus: activeSuspensions.length > 0 ? "Reviewing" : "Healthy",
      lastCanonUpdate: {
        date: lastCanon?.effectiveDate || Date.now(),
        intentSummary: lastCanon?.adoptionRationale || "Baseline protocol parameters active."
      },
      safetyStatus: activeSuspensions.length > 0 ? "A safety pause is active on one system parameter. Normal operation continues. Review in progress." : undefined
    };
  },

  async generateSeasonSummary(seasonId: string, communityId: string): Promise<SeasonCloseSummary> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Generate a Season Close Summary for WIZUP.
      Season: ${seasonId}
      Community: ${communityId}

      STRICT RULES:
      - Use plain, passive language. 
      - Tone: Librarian (factual, calm).
      - FORBIDDEN: Percentages, confidence scores, rankings, "top users", comparative metrics.
      - Describe observations, not successes.
      - Focus on protocol stability.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              observations: { type: Type.ARRAY, items: { type: Type.STRING } },
              stableParameters: { type: Type.ARRAY, items: { type: Type.STRING } },
              plannedRefinements: { type: Type.ARRAY, items: { type: Type.STRING } },
              unchangedProtocol: { type: Type.STRING }
            },
            required: ["observations", "stableParameters", "plannedRefinements", "unchangedProtocol"]
          }
        },
        contents: prompt
      });

      const result = JSON.parse(response.text || "{}");
      
      return {
        seasonId,
        communityId,
        ...result,
        publishedAt: Date.now()
      };
    } catch (e) {
      console.error("[TRUST] Failed to generate season summary", e);
      throw e;
    }
  }
};
