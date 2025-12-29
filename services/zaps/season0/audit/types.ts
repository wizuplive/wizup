
/**
 * 🔍 LEGITIMACY AUDIT ENGINE — INTERNAL TYPES
 * ==========================================
 */

export type AuditVerdict = "PASS" | "SOFT_RISK" | "HARD_FAIL";

export interface AuditFinding {
  dimension: "CONCENTRATION" | "DIVERSITY" | "STEWARDSHIP" | "J2E_INTEGRITY" | "SILENCE";
  verdict: AuditVerdict;
  riskFlags: string[];
  narrative: string;
}

export interface Season0AuditArtifact {
  seasonId: string;
  communityId: string;
  findings: AuditFinding[];
  auditedAt: number;
  artifactHash: string;
}
