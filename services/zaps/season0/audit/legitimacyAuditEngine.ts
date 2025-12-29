
import { SeasonalSimulationArtifact } from "../types";
import { ZapsSignalEvent } from "../../zapsSignals/zapsSignals.types";
import { AuditFinding, Season0AuditArtifact, AuditVerdict } from "./types";
import { sha256Hex, canonicalJson } from "../hash";

/**
 * 🔍 LEGITIMACY AUDIT ENGINE
 * ==========================
 * Purely analytical layer. No UI, no side effects.
 */

export const legitimacyAuditEngine = {
  async runAudit(
    artifact: SeasonalSimulationArtifact,
    rawSignals: ZapsSignalEvent[]
  ): Promise<Season0AuditArtifact> {
    const findings: AuditFinding[] = [
      this.auditConcentration(artifact),
      this.auditDiversity(artifact, rawSignals),
      this.auditStewardship(artifact, rawSignals),
      this.auditJ2EIntegrity(artifact, rawSignals),
      this.auditSilence(artifact, rawSignals)
    ];

    const hash = await sha256Hex(canonicalJson({ artifactHash: artifact.hashes.outputHash, findings }));

    return {
      seasonId: artifact.seasonId,
      communityId: artifact.communityId,
      findings,
      auditedAt: Date.now(),
      artifactHash: hash
    };
  },

  auditConcentration(artifact: SeasonalSimulationArtifact): AuditFinding {
    const weights = Object.values(artifact.resolvedWeights);
    const maxWeight = Math.max(...weights);
    const whaleClampHits = Object.values(artifact.capsApplied).filter(c => c.capReason === "MAX_SHARE_CLAMP").length;

    let verdict: AuditVerdict = "PASS";
    const riskFlags: string[] = [];
    let narrative = "Authority is broadly distributed across participants.";

    if (maxWeight > 0.20) {
      verdict = "HARD_FAIL";
      riskFlags.push("CRITICAL_CONCENTRATION");
      narrative = "Single entity controls a significant portion of community legitimacy despite clamps.";
    } else if (whaleClampHits > 3) {
      verdict = "SOFT_RISK";
      riskFlags.push("HIGH_PRESSURE_CLAMPS");
      narrative = "Clamps are preventing extreme concentration, but participation remains narrow.";
    }

    return { dimension: "CONCENTRATION", verdict, riskFlags, narrative };
  },

  auditDiversity(artifact: SeasonalSimulationArtifact, signals: ZapsSignalEvent[]): AuditFinding {
    const typeDistribution: Record<string, number> = {};
    signals.forEach(s => {
      typeDistribution[s.type] = (typeDistribution[s.type] || 0) + 1;
    });

    const activeTypes = Object.keys(typeDistribution).length;
    let verdict: AuditVerdict = "PASS";
    const riskFlags: string[] = [];
    let narrative = "Legitimacy derived from diverse participation classes.";

    if (activeTypes < 2) {
      verdict = "HARD_FAIL";
      riskFlags.push("MONOCULTURE_DETECTION");
      narrative = "Outcome relies solely on a single signal class. High risk of systemic gaming.";
    } else if (typeDistribution["UPVOTE"] > signals.length * 0.9) {
      verdict = "SOFT_RISK";
      riskFlags.push("VOTE_DOMINANCE");
      narrative = "Outcomes are heavily weighted toward passive endorsement signals.";
    }

    return { dimension: "DIVERSITY", verdict, riskFlags, narrative };
  },

  auditStewardship(artifact: SeasonalSimulationArtifact, signals: ZapsSignalEvent[]): AuditFinding {
    const stewardshipSignals = signals.filter(s => 
      s.type === "MODERATION_ACTION" || s.type === "GOVERNANCE_PROPOSAL"
    );

    let verdict: AuditVerdict = "PASS";
    const riskFlags: string[] = [];
    let narrative = "Stewardship presence is detectable and meaningful.";

    if (stewardshipSignals.length === 0) {
      verdict = "HARD_FAIL";
      riskFlags.push("STREWARDSHIP_ABSENCE");
      narrative = "No governance or moderation signals recorded. Community lacks civic structure.";
    }

    return { dimension: "STEWARDSHIP", verdict, riskFlags, narrative };
  },

  auditJ2EIntegrity(artifact: SeasonalSimulationArtifact, signals: ZapsSignalEvent[]): AuditFinding {
    const joins = signals.filter(s => s.type === "COMMUNITY_JOIN");
    const retentionSignals = signals.filter(s => 
      s.type === "COMMENT" || s.type === "GOVERNANCE_VOTE"
    );

    let verdict: AuditVerdict = "PASS";
    const riskFlags: string[] = [];
    let narrative = "Join legitimacy is balanced by retention signals.";

    if (joins.length > 0 && retentionSignals.length === 0) {
      verdict = "HARD_FAIL";
      riskFlags.push("EMPTY_JOIN_SPIKE");
      narrative = "High join volume detected without corresponding retention activity.";
    }

    return { dimension: "J2E_INTEGRITY", verdict, riskFlags, narrative };
  },

  auditSilence(artifact: SeasonalSimulationArtifact, signals: ZapsSignalEvent[]): AuditFinding {
    let verdict: AuditVerdict = "PASS";
    const riskFlags: string[] = [];
    let narrative = "Noise-to-signal ratio is nominal. High-volume actors are dampened.";

    const burstActors = new Set(
      Object.values(artifact.capsApplied)
        .filter(c => c.raw > c.capped * 3)
        .map((_, i) => i) // Mock indicator for high raw mass
    );

    if (burstActors.size > signals.length * 0.2) {
      verdict = "SOFT_RISK";
      riskFlags.push("WIDESPREAD_DAMPENING");
      narrative = "Significant portion of participants are hitting dampening curves. Noise level is elevated.";
    }

    return { dimension: "SILENCE", verdict, riskFlags, narrative };
  }
};
