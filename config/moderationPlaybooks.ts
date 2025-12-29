
import { EscalationLane } from "../types/modTypes";

export interface PlaybookContent {
  lane: EscalationLane;
  title: string;
  intent: string;
  guidance: string;
  considerations: string[];
}

export const PLAYBOOKS: Record<EscalationLane, PlaybookContent> = {
  [EscalationLane.NORMAL_REVIEW]: {
    lane: EscalationLane.NORMAL_REVIEW,
    title: "Standard Review",
    intent: "Routine content evaluation.",
    guidance: "Review when time permits. No specific risk signals detected.",
    considerations: [
      "Does this align with community tone?",
      "Is the content relevant to the channel?"
    ]
  },
  [EscalationLane.PRIORITY_REVIEW]: {
    lane: EscalationLane.PRIORITY_REVIEW,
    title: "Priority Context",
    intent: "routed due to potential security or spam risk signals.",
    guidance: "Recommended to verify author history and link destinations.",
    considerations: [
      "Check account age and previous activity.",
      "Verify external links are safe.",
      "Look for patterns of repetitive posting."
    ]
  },
  [EscalationLane.SENSITIVE_REVIEW]: {
    lane: EscalationLane.SENSITIVE_REVIEW,
    title: "Sensitive Handling",
    intent: "Routed due to high toxicity or conflict signals.",
    guidance: "Approach with care. Consider the impact on community safety.",
    considerations: [
      "Is this a personal attack or heated debate?",
      "Check for context (reply chains).",
      "Consider using a 'Warning' note instead of a ban if first offense."
    ]
  },
  [EscalationLane.LEGAL_REVIEW]: {
    lane: EscalationLane.LEGAL_REVIEW,
    title: "Legal / Policy",
    intent: "Routed for compliance review.",
    guidance: "Do not approve without verifying platform policy.",
    considerations: [
      "Prohibited goods or services?",
      "Copyright infringement risks?",
      "Severe platform violations?"
    ]
  }
};
