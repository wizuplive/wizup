
import { CommunityCharter, CharterArchetype } from "../../types/federalismTypes";

const CHARTER_KEY = "wizup_community_charters_v12";

/**
 * 🏛️ CHARTER SERVICE
 * ==================
 * "Shared law. Local meaning."
 * 
 * Rules:
 * 1. Subsidiarity: Decisions are made as locally as possible.
 * 2. Canon Superiority: Charters cannot override platform safety.
 * 3. Scoped: Norms only apply within the community boundary.
 */

const ARCHETYPE_DEFAULTS: Record<CharterArchetype, Partial<CommunityCharter>> = {
  OPEN_DISCUSSION: {
    localNorms: ["Wide topical breadth", "Low friction for dissent"],
    posture: "RELAXED",
    jurisdiction: { allowsCrossposts: true, requiresLocalStatus: false }
  },
  PROFESSIONAL_PRACTICE: {
    localNorms: ["High relevance", "Constructive peer review", "Professional tone"],
    posture: "STRICT",
    jurisdiction: { allowsCrossposts: false, requiresLocalStatus: true }
  },
  LEARNING_MENTORSHIP: {
    localNorms: ["Safe for beginners", "Encouraging language", "Structured feedback"],
    posture: "BALANCED",
    jurisdiction: { allowsCrossposts: true, requiresLocalStatus: true }
  },
  HIGH_SIGNAL_RESEARCH: {
    localNorms: ["Evidence required", "No anecdotal noise", "Source-heavy"],
    posture: "STRICT",
    jurisdiction: { allowsCrossposts: false, requiresLocalStatus: true }
  },
  SOCIAL_CASUAL: {
    localNorms: ["Memes permitted", "Lighthearted tone", "Topic flexible"],
    posture: "RELAXED",
    jurisdiction: { allowsCrossposts: true, requiresLocalStatus: false }
  }
};

export const charterService = {
  
  async get(communityId: string): Promise<CommunityCharter> {
    const all = this.getAll();
    const existing = all.find(c => c.communityId === communityId);
    if (existing) return existing;

    // Default to Open Discussion if no charter exists
    return this.initialize(communityId, "OPEN_DISCUSSION");
  },

  initialize(communityId: string, archetype: CharterArchetype): CommunityCharter {
    const defaults = ARCHETYPE_DEFAULTS[archetype];
    const charter: CommunityCharter = {
      communityId,
      archetype,
      localNorms: defaults.localNorms || [],
      posture: defaults.posture || "BALANCED",
      jurisdiction: defaults.jurisdiction || { allowsCrossposts: true, requiresLocalStatus: false },
      version: "1.0",
      updatedAt: Date.now()
    };
    this.save(charter);
    return charter;
  },

  save(charter: CommunityCharter) {
    const all = this.getAll();
    const idx = all.findIndex(c => c.communityId === charter.communityId);
    if (idx >= 0) all[idx] = charter;
    else all.push(charter);
    localStorage.setItem(CHARTER_KEY, JSON.stringify(all));
  },

  getAll(): CommunityCharter[] {
    try {
      return JSON.parse(localStorage.getItem(CHARTER_KEY) || "[]");
    } catch { return []; }
  }
};
