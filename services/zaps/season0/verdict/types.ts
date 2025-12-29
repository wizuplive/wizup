
export type VerdictState = "ALLOW" | "CONDITIONAL" | "BLOCK";

export interface Season0LegitimacyVerdict {
  seasonId: string;
  communityId: string;
  verdict: VerdictState;
  primaryConcerns: string[];
  counterfactualFindings: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  hashes: {
    season0ArtifactHash: string;
    auditConfigHash: string;
    verdictHash: string;
  };
  signedAt: number;
}
