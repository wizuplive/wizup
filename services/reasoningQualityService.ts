
import { ModCase, EscalationLane } from "../types/modTypes";
import { 
  ReasoningQualityEvent, 
  QualityFlag, 
  OutcomeAlignment, 
  ReasoningTemplateKey 
} from "../types/reasoningQualityTypes";
import { dataService } from "./dataService";
import { modPolicyService } from "./modPolicyService";
import { sovereignReasoningService } from "./sovereignReasoningService";

/**
 * REASONING QUALITY SERVICE v0 (Phase 4.2)
 * ========================================
 * A silent, non-intrusive observer that evaluates the efficacy of reasoning explanations
 * after human intervention.
 * 
 * Contract:
 * 1. Read-Only logic (no side effects on moderation).
 * 2. Write-Only telemetry (no UI feedback).
 * 3. Fail-Open (errors are caught and ignored).
 */

export const reasoningQualityService = {

  async recordOutcome(communityId: string, modCase: ModCase) {
    try {
        // 1. Gating: Only care about terminal cases
        if (modCase.status !== 'RESOLVED' && modCase.status !== 'DISMISSED') return;

        // 2. Hydration: Need Policy to reconstruct the explanation that was shown
        const policy = await modPolicyService.getCompiled(communityId);
        
        // 3. Reconstruction: Rebuild the artifact deterministically
        const artifact = sovereignReasoningService.buildReasoning(modCase, policy);
        
        // 4. Outcome Determination
        // If status is RESOLVED (Action Taken) -> CONFIRMED
        // If status is DISMISSED (Action Rejected) -> OVERRIDDEN
        // Note: This logic assumes the AI suggested an action (HOLD/NOTE/TAG).
        const outcome = modCase.status === 'RESOLVED' ? 'CONFIRMED' : 'OVERRIDDEN';

        // 5. Template Key Inference
        // Since v0 artifacts are generated deterministically based on headline, we reverse map it.
        let templateKey: ReasoningTemplateKey = 'UNKNOWN';
        if (artifact) {
            if (artifact.headline.includes("manipulation")) templateKey = 'MANIPULATION';
            else if (artifact.headline.includes("integrity")) templateKey = 'INTEGRITY';
            else if (artifact.headline.includes("Context")) templateKey = 'CONTEXT';
        }

        // 6. Signal Derivation
        const flags: QualityFlag[] = [];
        let alignment: OutcomeAlignment = 'ALIGNED';

        if (!artifact) {
            flags.push('NO_REASONING_GENERATED');
        } else {
            if (outcome === 'CONFIRMED') {
                alignment = 'ALIGNED';
                flags.push('EXPLANATION_ALIGNED');
            } else {
                alignment = 'MISALIGNED';
                flags.push('EXPLANATION_MISLEADING');

                // Advanced Heuristics
                if (templateKey !== 'CONTEXT') {
                    // Strong claim overridden -> Uncertainty wasn't sufficient
                    flags.push('UNCERTAINTY_UNDERSPECIFIED');
                } else {
                    // Context claim overridden -> Expected behavior (Human provides context)
                    flags.push('CONTEXT_DEPENDENT_CASE');
                }
            }
        }

        // 7. Event Construction
        const event: ReasoningQualityEvent = {
            id: crypto.randomUUID(),
            caseId: modCase.id,
            communityId,
            timestamp: Date.now(),
            templateKey,
            lane: modCase.escalation?.lane || EscalationLane.NORMAL_REVIEW,
            finalOutcome: outcome,
            alignment,
            qualityFlags: flags
        };

        // 8. Shadow Write
        await dataService.shadowWriteReasoningQualityEvent(communityId, event);

    } catch (e) {
        // Silent Fail - Observation must never crash execution
        console.warn("[ReasoningQuality] Observer failed silently:", e);
    }
  }
};
