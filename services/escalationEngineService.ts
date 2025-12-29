
import { CompiledPolicy, PolicyCategory } from "../types/policyTypes";
import { EscalationDecision, EscalationLane } from "../types/modTypes";

/**
 * ESCALATION ENGINE v0
 * ====================
 * Deterministic routing for moderation cases.
 * 
 * Rules:
 * 1. Fail-Open: Always returns a valid decision (defaults to NORMAL).
 * 2. Routing Only: Does not mutate content.
 * 3. Semantic Lanes: Maps raw scores to human-readable priority queues.
 */

export const escalationEngineService = {
  
  evaluate(
    policy: CompiledPolicy,
    category: PolicyCategory,
    scores: { spam: number; toxicity: number; scam: number; linkRisk: number }
  ): EscalationDecision {
    // 0. Default Safe State
    const decision: EscalationDecision = {
      lane: EscalationLane.NORMAL_REVIEW,
      urgency: 'LOW',
      rationale: 'Standard review queue.'
    };

    try {
      // 1. Map Scores to Category Key
      const scoreKeyMap: Record<PolicyCategory, number> = {
        'SPAM': scores.spam,
        'TOXICITY': scores.toxicity,
        'SCAM': scores.scam,
        'LINK_RISK': scores.linkRisk
      };
      
      const primaryScore = scoreKeyMap[category] || 0;

      // 2. Check for HIGH Urgency Signals (Scam / Security)
      // These pose immediate risk to users, so they skip to Priority.
      if (category === 'SCAM' && primaryScore > 0.85) {
        return {
          lane: EscalationLane.PRIORITY_REVIEW,
          urgency: 'HIGH',
          rationale: 'High-confidence financial risk detected.'
        };
      }

      if (category === 'LINK_RISK' && primaryScore > 0.9) {
        return {
          lane: EscalationLane.PRIORITY_REVIEW,
          urgency: 'HIGH',
          rationale: 'Potential phishing or malicious link.'
        };
      }

      // 3. Check for Sensitive Content (Extreme Toxicity)
      // High toxicity needs careful review, potentially by senior mods (Sensitive Lane).
      if (category === 'TOXICITY' && primaryScore > 0.95) {
        return {
          lane: EscalationLane.SENSITIVE_REVIEW,
          urgency: 'HIGH',
          rationale: 'Extreme toxicity detected. Requires sensitive handling.'
        };
      }

      // 4. Policy Strictness Check
      // If the policy is STRICT (hold threshold < 0.8), we elevate moderate risks to Priority.
      // This ensures strict communities see "borderline" cases faster.
      const thresholdConfig = policy.thresholds[category];
      const isStrictPolicy = thresholdConfig.hold < 0.8;

      if (isStrictPolicy && primaryScore > (thresholdConfig.hold + 0.05)) {
         return {
          lane: EscalationLane.PRIORITY_REVIEW,
          urgency: 'MEDIUM',
          rationale: 'Elevated priority due to strict community safety policy.'
        };
      }

      // 5. Default Fallback
      return decision;

    } catch (e) {
      console.error("[EscalationEngine] Evaluation failed, defaulting to normal.", e);
      return decision;
    }
  }
};
