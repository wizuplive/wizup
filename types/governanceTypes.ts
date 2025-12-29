import { ReputationTierId } from "../services/reputationService";
import { UserRole } from "../services/reputationMappingService";

export type ProposalType = 
  | "POLICY_INTENT_PRESET"  // Relaxed / Standard / Strict
  | "SAFEGUARDS_FOCUS"     // Spam / Harassment / Fraud toggles
  | "ACCESS_MODEL"         // Open / Paid / ZAPS
  | "STEWARD_PROMOTION";   // Nominate member to T3+

export type ProposalStatus = "OPEN" | "CLOSED" | "EXPIRED";

export interface GovernanceProfile {
  communityId: string;
  userId: string;
  tierId: ReputationTierId;
  role: UserRole;
  computedWeight: number; // The numeric kernel (never shown in UI)
  computedAt: number;
  decayState: "NOMINAL" | "DAMPENED";
}

export interface Proposal {
  id: string;
  communityId: string;
  type: ProposalType;
  status: ProposalStatus;
  title: string;
  description: string;
  parameters: any; // E.g., { preset: 'STRICT' }
  createdBy: string;
  createdAt: number;
  closesAt: number;
  policyHash?: string; // Link to the policy used at creation
}

export interface Vote {
  proposalId: string;
  userId: string;
  choice: "YES" | "NO";
  weightAtCast: number;
  castAt: number;
}