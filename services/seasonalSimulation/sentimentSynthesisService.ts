
import { GoogleGenAI, Type } from "@google/genai";
import { TradeoffMap, CommunitySentimentSignal } from "../../types/governanceV11Types";
import { civicAgencyService } from "./civicAgencyService";

/**
 * 🤖 SENTIMENT SYNTHESIS SERVICE
 * ==============================
 * Role: Librarian. Translates community input into tradeoff maps.
 */

export const sentimentSynthesisService = {

  async synthesize(promptId: string): Promise<TradeoffMap | null> {
    const prompt = civicAgencyService.getPrompt(promptId);
    const signals = civicAgencyService.getSignalsForPrompt(promptId);

    if (!prompt || signals.length === 0) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = {
      prompt: prompt.title,
      context: prompt.context,
      options: prompt.options,
      signalCount: signals.length,
      gradientDistribution: this.computeDistribution(signals)
    };

    const sysPrompt = `
      You are a non-coercive Sentiment Synthesizer for WIZUP.
      Aggregate the following community input into a Tradeoff Map.
      
      Requirements:
      - TONE: Librarian (Neutral, observant, calm).
      - NO Winners: Do not recommend an option.
      - Tradeoffs: Explicitly identify what is gained vs sacrificed in the consensus.
      - Unresolved: Highlight where the community is fragmented or concerned.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              consensusClusters: { type: Type.ARRAY, items: { type: Type.STRING } },
              unresolvedTensions: { type: Type.ARRAY, items: { type: Type.STRING } },
              observedTradeoffs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    gain: { type: Type.STRING },
                    sacrifice: { type: Type.STRING },
                    sentimentWeight: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
                  },
                  required: ["gain", "sacrifice", "sentimentWeight"]
                }
              },
              librarianSummary: { type: Type.STRING },
              confidence: { type: Type.STRING, enum: ["CLEAR", "FRAGMENTED"] }
            },
            required: ["consensusClusters", "unresolvedTensions", "observedTradeoffs", "librarianSummary", "confidence"]
          }
        },
        contents: `${sysPrompt}\n\nContext: ${JSON.stringify(context)}\nSample Signals: ${JSON.stringify(signals.slice(0, 50))}`
      });

      const result = JSON.parse(response.text || "{}");
      return { promptId, ...result };

    } catch (error) {
      console.error("[SENTIMENT] Synthesis failed", error);
      return null;
    }
  },

  computeDistribution(signals: CommunitySentimentSignal[]) {
    const dist: Record<string, number> = {};
    signals.forEach(s => {
      dist[s.preference] = (dist[s.preference] || 0) + 1;
    });
    return dist;
  }
};
