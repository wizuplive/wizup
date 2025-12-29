
import { dataService } from "./dataService";
import { ModCase, ModAction, AutopilotEligibility, CaseStatus, ModPolicy, AutopilotState } from "../types/modTypes";

/**
 * PHASE 2.1: AUTOPILOT ELIGIBILITY ENGINE
 * 
 * This service acts as a "Silent Observer".
 * It monitors moderation patterns to determine if a community is ready for automation.
 * 
 * RULES:
 * 1. Read-only analysis. No side effects.
 * 2. Strict thresholds. Automation must be earned.
 * 3. Output is stored internally, not shown to users yet.
 */

const MIN_CASE_VOLUME = 3; // Low for testing, would be 50+ in prod
const MIN_AGREEMENT_RATE = 0.8; // 80% alignment required
const MAX_REVERSALS = 0; // Zero tolerance for reversals in this phase

// PHASE 2.2C STEP 2: DEFINE CANARY COMMUNITIES
const CANARY_COMMUNITIES = ['2']; // '2' is "Web3 Builders Club"

export const autopilotEligibilityService = {
  
  async evaluate(communityId: string): Promise<AutopilotEligibility> {
    console.log(`[Eligibility Engine] Evaluating community: ${communityId}`);

    // 1. Fetch Raw Data (Guarded Source Flip: Cloud -> Local)
    const cases = await dataService.getModCases(communityId);
    const actions = await dataService.getModActions(communityId);

    // 2. Filter for Completed Human Decisions
    const resolvedCases = cases.filter(c => 
      c.status === CaseStatus.RESOLVED || c.status === CaseStatus.DISMISSED
    );

    // 3. Compute Signals
    
    // A. Maturity (Volume)
    const maturityScore = Math.min(1, resolvedCases.length / MIN_CASE_VOLUME);
    
    // B. Alignment (Agreement)
    // Agreement = Cases where status is RESOLVED (Action taken) vs DISMISSED (Action rejected)
    // NOTE: This assumes 'RESOLVED' means the user agreed with the AI's "suggestion".
    const agreedCount = resolvedCases.filter(c => c.status === CaseStatus.RESOLVED).length;
    const agreementRate = resolvedCases.length > 0 ? agreedCount / resolvedCases.length : 0;
    const dismissalRate = 1 - agreementRate;

    // C. Stability (Reversals)
    // Look for actions where actor='CREATOR' and action='RESTORE'
    const reversalCount = actions.filter(a => a.action === 'RESTORE').length;

    // 4. Determine Eligibility
    const blockingReasons: string[] = [];
    
    // --- CANARY OVERRIDE ---
    // If this is a designated canary, we bypass volume checks but keep safety checks (reversals).
    const isCanary = CANARY_COMMUNITIES.includes(communityId);

    if (!isCanary) {
        if (resolvedCases.length < MIN_CASE_VOLUME) {
          blockingReasons.push("Insufficient moderation volume");
        }
        
        if (agreementRate < MIN_AGREEMENT_RATE) {
          blockingReasons.push("Low alignment with AI suggestions");
        }
    }
    
    if (reversalCount > MAX_REVERSALS) {
      blockingReasons.push("History of manual reversals");
    }

    const isEligible = blockingReasons.length === 0;
    
    // 5. Construct Result
    const eligibility: AutopilotEligibility = {
      communityId,
      isEligible,
      confidence: (isCanary || resolvedCases.length > 10) ? "HIGH" : resolvedCases.length > 5 ? "MEDIUM" : "LOW",
      signals: {
        maturityScore: isCanary ? 1 : maturityScore,
        agreementRate,
        dismissalRate,
        reversalCount
      },
      blockingReasons,
      lastEvaluatedAt: Date.now()
    };

    // 6. Persist Internal Record
    await dataService.set(`autopilot_eligibility:${communityId}`, eligibility);
    
    // 7. Shadow Persistence (Firestore Mirror)
    dataService.shadowWriteEligibility(communityId, eligibility);
    
    // 8. PHASE 3: Shadow Verification
    // Verify that the cloud copy matches what we just computed (Consistency Check)
    dataService.verifyEligibility(communityId, eligibility);
    
    console.log(`[Eligibility Engine] Verdict for ${communityId}: ${isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}`, blockingReasons);
    
    return eligibility;
  },

  /**
   * PHASE 2.2A: STATE DERIVATION
   * Derives the UX state based on Policy (Intent) and Eligibility (Capability).
   */
  getAutopilotState(policy: ModPolicy, eligibility: AutopilotEligibility): AutopilotState {
    if (!eligibility.isEligible) {
      return 'LOCKED';
    }

    if (policy.mode === 'AUTOPILOT') {
      return 'ENABLED';
    }

    // If eligible but not enabled, it's either ELIGIBLE (fresh) or PAUSED (was active).
    // For this implementation, we check if it was previously enabled via a flag or assume ELIGIBLE.
    // In a real DB we'd track `lastActiveAt`. Here we assume if mode is ASSIST it's ELIGIBLE.
    // A separate store key could track 'userPausedAutopilot' to distinguish PAUSED from ELIGIBLE.
    return 'ELIGIBLE'; 
  }
};
