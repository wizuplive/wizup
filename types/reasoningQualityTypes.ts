
import { EscalationLane } from './modTypes';
import { PolicySeverity } from './policyTypes';

export type OutcomeAlignment = 'ALIGNED' | 'MISALIGNED';
export type ExplanationFit = 'CLEAR' | 'UNCLEAR';

export type QualityFlag = 
  | 'EXPLANATION_ALIGNED'
  | 'EXPLANATION_MISLEADING'
  | 'UNCERTAINTY_UNDERSPECIFIED'
  | 'CONTEXT_DEPENDENT_CASE'
  | 'POLICY_TENSION'
  | 'NO_REASONING_GENERATED';

export type ReasoningTemplateKey = 'MANIPULATION' | 'INTEGRITY' | 'CONTEXT' | 'UNKNOWN';

export interface ReasoningQualityEvent {
  id: string;
  caseId: string;
  communityId: string;
  timestamp: number;
  
  // Inputs
  templateKey: ReasoningTemplateKey;
  lane: EscalationLane;
  policyIntent?: PolicySeverity; // Derived if available
  finalOutcome: 'CONFIRMED' | 'OVERRIDDEN'; // Derived from CaseStatus
  
  // Derived Quality Signals
  alignment: OutcomeAlignment;
  qualityFlags: QualityFlag[];
}
