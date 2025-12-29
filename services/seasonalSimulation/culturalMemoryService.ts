
import { GoogleGenAI, Type } from "@google/genai";
import { CultureSnapshot, CanonMoment } from "../../types/culturalMemoryTypes";
import { driftLogService } from "../driftLogService";

const SNAPSHOTS_KEY = "wizup_culture_snapshots_v14";
const CANON_MOMENTS_KEY = "wizup_canon_moments_v14";

/**
 * 🏺 CULTURAL MEMORY SERVICE
 * ==========================
 * "Culture is not frozen. It is remembered and re-expressed."
 */

export const culturalMemoryService = {

  async captureSeason(communityId: string, seasonId: string): Promise<CultureSnapshot> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // In a real system, we would gather seasonal metrics here.
    // For the simulation, we provide the context to Gemini.
    const prompt = `
      Synthesize the "Soul" of community ${communityId} for Season ${seasonId}.
      Base the synthesis on the current community behavior patterns.
      
      Requirements:
      - Neutral, librarian tone.
      - Qualitative only.
      - Summarize Normative Profile (Tolerated vs Rejected).
      - Identify Reputation Shape.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              normativeProfile: {
                type: Type.OBJECT,
                properties: {
                  toleratedBehaviors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rejectedBehaviors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  moderationPosture: { type: Type.STRING }
                },
                required: ["toleratedBehaviors", "rejectedBehaviors", "moderationPosture"]
              },
              governanceTendencies: { type: Type.ARRAY, items: { type: Type.STRING } },
              reputationShape: { type: Type.STRING, enum: ["PYRAMID", "DIAMOND", "FLAT"] }
            },
            required: ["normativeProfile", "governanceTendencies", "reputationShape"]
          }
        },
        contents: prompt
      });

      const result = JSON.parse(response.text || "{}");
      const snapshot: CultureSnapshot = {
        id: `snap_${Date.now()}`,
        communityId,
        seasonId,
        ...result,
        timestamp: Date.now(),
        hash: driftLogService.hash(result)
      };

      this.saveSnapshot(snapshot);
      return snapshot;
    } catch (e) {
      console.error("[MEMORY] Snapshot synthesis failed", e);
      throw e;
    }
  },

  archiveMoment(moment: Omit<CanonMoment, 'id' | 'timestamp'>) {
    const moments = this.getCanonMoments();
    const newMoment: CanonMoment = {
      ...moment,
      id: `moment_${Date.now()}`,
      timestamp: Date.now()
    };
    moments.push(newMoment);
    localStorage.setItem(CANON_MOMENTS_KEY, JSON.stringify(moments));
    console.log(`%c[MEMORY] Canon Moment Archived: ${moment.title}`, "color: #8b5cf6; font-weight: bold;");
  },

  getSnapshots(communityId: string): CultureSnapshot[] {
    const all = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || "[]");
    return all.filter((s: CultureSnapshot) => s.communityId === communityId);
  },

  saveSnapshot(snap: CultureSnapshot) {
    const all = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || "[]");
    all.push(snap);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(all));
  },

  getCanonMoments(communityId?: string): CanonMoment[] {
    const all = JSON.parse(localStorage.getItem(CANON_MOMENTS_KEY) || "[]");
    if (communityId) return all.filter((m: CanonMoment) => m.communityId === communityId);
    return all;
  }
};
