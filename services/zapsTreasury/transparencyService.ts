import { zapsTreasuryService } from "./zapsTreasuryService";
import { joinToEarnService } from "../zapsRecognition/joinToEarn/joinToEarnService";
import { reputationService } from "../reputationService";
import { dataService } from "../dataService";

export type TransparencyRole = 'PUBLIC' | 'MEMBER' | 'CREATOR' | 'STEWARD' | 'OWNER';

export interface TreasuryTransparencyData {
  status: {
    label: string;
    subline: string;
    color: 'green' | 'yellow' | 'blue';
  };
  intent?: string;
  mode?: string;
  guardrails?: string[];
  historySummary?: string;
  seasons?: string[];
  freezeDetails?: {
    reason: string;
    timestamp: number;
    checklist: string[];
  };
}

export const transparencyService = {
  /**
   * Resolve a user's transparency role within a specific community context.
   */
  resolveRole(userId: string, communityId: string): TransparencyRole {
    if (!userId) return 'PUBLIC';

    const user = dataService.getCurrentUser();
    const standing = reputationService.getScopedStanding(userId, communityId);

    // Simplification for demo: Influencers/Creators are Owners/Creators.
    // T3/T4 are Stewards.
    if (user?.isInfluencer && communityId === 'Design Systems Mastery') return 'OWNER'; // Mock owner check
    if (standing.tier.id === 'T4_ANCHOR' || standing.tier.id === 'T3_STEWARD') return 'STEWARD';
    if (user?.isInfluencer) return 'CREATOR';
    if (standing.tier.id !== 'T0_OBSERVER') return 'MEMBER';
    
    return 'PUBLIC';
  },

  /**
   * Get the qualitative transparency payload.
   * INVARIANT: No numeric balances or spend amounts.
   */
  async getTransparencyData(communityId: string, role: TransparencyRole): Promise<TreasuryTransparencyData | null> {
    if (role === 'PUBLIC') return null;

    const summary = zapsTreasuryService.getSummary(communityId);
    const j2e = joinToEarnService.getProgram(communityId);

    // 1. Resolve Status
    let statusLabel = "Active & Balanced";
    let statusSubline = "This community distributes ZAPS to recognize meaningful participation.";
    let statusColor: 'green' | 'yellow' | 'blue' = 'green';

    if (summary.isFrozen) {
      statusLabel = "Paused for Review";
      statusSubline = "Distributions are temporarily paused to ensure fairness.";
      statusColor = 'yellow';
    } else if (summary.balance < 500) {
      statusLabel = "Season Complete";
      statusSubline = "Seasonal allocation is concluded. Awaiting next cycle.";
      statusColor = 'blue';
    }

    const data: TreasuryTransparencyData = {
      status: { label: statusLabel, subline: statusSubline, color: statusColor }
    };

    // 2. Member Layer (Intent)
    if (['MEMBER', 'CREATOR', 'STEWARD', 'OWNER'].includes(role)) {
      data.intent = "ZAPS are used here to welcome new members, recognize contribution, and support stewardship.";
    }

    // 3. Creator Layer (Mode)
    if (['CREATOR', 'STEWARD', 'OWNER'].includes(role)) {
      if (summary.isFrozen) data.mode = "Distribution Paused";
      else if (j2e?.isActive && !j2e?.isPaused) data.mode = "Join-to-Earn Active";
      else data.mode = "Contribution Recognition Only";
    }

    // 4. Steward Layer (Guardrails + History)
    if (['STEWARD', 'OWNER'].includes(role)) {
      data.guardrails = [
        "Per-member caps enforced",
        "Cooldowns active",
        "Abuse protection enabled"
      ];
      data.historySummary = "This treasury has operated across 2 Seasons.";
      data.seasons = ["Season 0 — Calibration", "Season 1 — Live Recognition"];
    }

    // 5. Owner Layer (Audit Context)
    if (role === 'OWNER' && summary.isFrozen) {
      data.freezeDetails = {
        reason: "System-initiated safety freeze (Velocity detection)",
        timestamp: summary.lastActionAt,
        checklist: [
          "Root cause identified",
          "Parameters reviewed",
          "Treasury exposure recalculated",
          "Steward acknowledgment"
        ]
      };
    }

    return data;
  }
};