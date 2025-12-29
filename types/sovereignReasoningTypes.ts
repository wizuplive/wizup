
import { PolicySeverity } from "./policyTypes";

// Qualitative Tags (No numbers)
export type ReasoningSignalChip = 
  | "Link redirection"
  | "Promise framing"
  | "Urgency language"
  | "Off-platform push"
  | "Personal targeting"
  | "Dismissive tone"
  | "Provocation"
  | "Mixed cues"
  | "Possible misunderstanding"
  | "Repetitive pattern";

export interface SovereignReasoningArtifact {
  headline: string;
  summary: string;
  signals: ReasoningSignalChip[];
  uncertainty: string; // What the system didn't assume
  humanNext: string;   // Suggested review lens
  policyBasis: string; // References policy intent
  scopeNote: string;   // Fixed disclaimer
}
