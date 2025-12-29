
// PHASE 4: POLICY LANGUAGE v0
// Defines the contract between User Intent (Spec) and System Execution (Compiled).

export type PolicySeverity = 'RELAXED' | 'STANDARD' | 'STRICT';
export type PolicyCategory = 'TOXICITY' | 'SPAM' | 'SCAM' | 'LINK_RISK';
export type PolicyMode = "OFF" | "ASSIST" | "AUTOPILOT" | "SOVEREIGN";

// 1. Creator-Facing Schema (Input)
export interface PolicySpec {
  communityId: string;
  mode: PolicyMode;
  severity: PolicySeverity;
  categories: PolicyCategory[];
  allowlistPatterns: string[];
  blocklistPatterns: string[];
  customInstructions?: string; // Placeholder for Phase 5
  version?: string;
}

// 2. Internal Execution Artifact (Output)
export interface ThresholdConfig {
  tag: number;
  notify: number; // Warn/Note
  hold: number;
}

export type RoutingDecision = 'HOLD' | 'ASSIST_ONLY' | 'ESCALATE';

export interface CompiledPolicy {
  version: string;
  communityId: string;
  effectiveMode: PolicyMode; // Resolves conflicts between requested mode and eligibility
  
  // Numeric gates derived from Severity Profile
  thresholds: Record<PolicyCategory, ThresholdConfig>;
  
  // Compiled Regex for performance
  matchers: {
    allowlist: RegExp[];
    blocklist: RegExp[];
  };
  
  // Escalation Matrix
  routes: Record<PolicyCategory, RoutingDecision>;
  
  // Audit properties
  policyHash: string;
  compiledAt: number;
}
