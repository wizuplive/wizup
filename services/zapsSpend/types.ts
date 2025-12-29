export type SpendIntentCategory = 
  | "ACCESS"       // Join spaces, unlock sub-spaces
  | "PERK"         // Posting privileges, visibility boosts (temporary)
  | "CONTRIBUTION" // Tipping, supporting initiatives
  | "COMMITMENT";  // Governance deposits, stewardship stakes

export interface SpendIntentRecord {
  id: string;
  userId: string;
  communityId: string;
  category: SpendIntentCategory;
  amount: number;
  description: string;
  timestamp: number;
  metadata?: Record<string, any>;
}