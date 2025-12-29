
// --- Enums ---

export enum CaseStatus {
  OPEN = 'OPEN',
  APPROVED = 'APPROVED',
  DISMISSED = 'DISMISSED',
  RESOLVED = 'RESOLVED'
}

export enum SuggestedAction {
  TAG = 'TAG',
  NOTE = 'NOTE',
  HOLD = 'HOLD'
}

export enum ModerationStatus {
  NONE = 'none',
  HELD = 'held',
  NOTED = 'noted',
  TAGGED = 'tagged'
}

// --- PHASE 4: ESCALATION ENGINE TYPES ---

export enum EscalationLane {
  NORMAL_REVIEW = 'NORMAL_REVIEW',
  PRIORITY_REVIEW = 'PRIORITY_REVIEW',
  SENSITIVE_REVIEW = 'SENSITIVE_REVIEW',
  LEGAL_REVIEW = 'LEGAL_REVIEW' // Stub for future use
}

export interface EscalationDecision {
  lane: EscalationLane;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
}

// --- PHASE 4.1: AGENT CONSENSUS MODEL (V4) ---

export type ConsensusStatus = 'ALIGNED' | 'UNCERTAIN' | 'CONTESTED';

export interface AgentPerspective {
  id: string;
  focus: string; // e.g. "Context", "Policy", "Safety"
  observation: string; // "Language suggests satire..."
  leaning: 'SAFE' | 'RISK' | 'NEUTRAL';
}

export interface ConsensusAnalysis {
  status: ConsensusStatus;
  headline: string;
  signals: string[];
  perspectives: AgentPerspective[];
}

// --- Interfaces ---

export interface PostModerationState {
  status: ModerationStatus;
  note?: string;       // For 'noted' status (e.g. Safety Note content)
  tags?: string[];     // For 'tagged' status (e.g. Clarity Tags)
  flaggedAt?: number;
  caseId?: string;     // Reference to the originating ModCase
}

export interface ModCase {
  id: string;
  communityId: string;
  contentId: string;
  contentType: "POST" | "COMMENT";
  authorId: string;
  
  status: CaseStatus;
  suggestedAction: SuggestedAction;
  
  // AI Analysis Data
  severity: "LOW" | "MED" | "HIGH";
  scores: { 
    spam: number; 
    toxicity: number; 
    scam: number; 
    linkRisk: number; 
  };
  rationale: string;
  evidence: string[]; // Snippets or quotes
  
  // AUDIT TRAIL
  source?: "BOOTSTRAP_SEED" | "LIVE"; // Phase 2.2C: Distinguish organic vs seeded history
  policyHash?: string; // Phase 4: Link to specific CompiledPolicy version
  policyVersion?: string;
  
  // PHASE 4: TRIAGE ROUTING
  escalation?: EscalationDecision;
  
  createdAt: number;
  updatedAt: number;
  decidedBy: "AI" | "HUMAN";
}

export interface ModAction {
  id: string;
  caseId: string;
  communityId: string;
  contentId: string;
  
  action: SuggestedAction | "RESTORE" | "NO_ACTION";
  actor: "AI_MOD" | "CREATOR" | "SOVEREIGN_AGENT";
  
  rationale?: string;
  timestamp: number;
}

// --- Phase 2.1: Autopilot Eligibility (Internal) ---

export interface EligibilitySignals {
  maturityScore: number;    // 0-1 based on volume of cases
  agreementRate: number;    // 0-1 % of AI suggestions accepted
  dismissalRate: number;    // 0-1 % of AI suggestions rejected
  reversalCount: number;    // Absolute count of manual RESTORES
}

export interface AutopilotEligibility {
  communityId: string;
  isEligible: boolean;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  signals: EligibilitySignals;
  blockingReasons: string[]; // e.g. "Insufficient volume", "Low alignment"
  lastEvaluatedAt: number;
}

// --- Phase 2.2A: Autopilot State Model ---
export type AutopilotState = 'LOCKED' | 'ELIGIBLE' | 'ENABLED' | 'PAUSED';

// --- Sovereign Agent v0 ---
export type SovereignState = 'LOCKED' | 'ELIGIBLE' | 'ENABLED' | 'PAUSED';

// --- Existing Types (Preserved for compatibility) ---

export type ModPolicy = {
  communityId: string;
  enabled: boolean;
  mode: "OFF" | "ASSIST" | "AUTOPILOT" | "SOVEREIGN";
  
  // Legacy numeric strictness (0-1) - Kept for backward compat
  strictness: number; 
  
  // PHASE 4 INTENT LAYER (Qualitative Settings)
  // These override `strictness` if present.
  severity?: 'RELAXED' | 'STANDARD' | 'STRICT';
  categories?: ('TOXICITY' | 'SPAM' | 'SCAM' | 'LINK_RISK')[];

  thresholds: { tagAbove: number; warnAbove: number; hideAbove: number; };
  permissions: { autoTag: boolean; autoWarn: boolean; autoHide: boolean; };
  linkPolicy: "ALLOW" | "REVIEW" | "BLOCK";
  updatedAt: number;
};

export type Entitlements = { 
  aiModsEnabled: boolean; 
  plan: "FREE" | "PRO" | "STUDIO" | "ENTERPRISE"; 
};
