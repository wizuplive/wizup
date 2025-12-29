
/**
 * 🔒 PHASE 2.2C FREEZE: AUTOPILOT EXECUTION
 * =========================================
 * The "Hands" of the system.
 * 
 * CONSTITUTIONAL RULES:
 * 1. ORDER: Memory Check -> Policy Check -> Threshold Check -> Execution.
 * 2. SAFETY: Fail Open (Exit on any error/doubt).
 * 3. SCOPE: HOLD action only. No deletes.
 * 
 * BOUNDARY ENFORCEMENT (SOVEREIGN v0):
 * - If policy is SOVEREIGN, this service executes the 'Shadow Fallback' (Hold Only).
 * - It MUST sign as 'AI_MOD' (Autopilot identity), NOT 'SOVEREIGN_AGENT'.
 * - 'SOVEREIGN_AGENT' signature is banned from live production actions in v0.
 * 
 * Memory gating must remain at the very top of the process method.
 * See docs/PHASE_2_2C_FREEZE.md for full invariants.
 */

import { feedService } from "./feedService";
import { modCaseService } from "./modCaseService";
import { modPolicyService } from "./modPolicyService";
import { autopilotEligibilityService } from "./autopilotEligibilityService";
import { SuggestedAction, CaseStatus, ModCase, ModAction, AutopilotState, ModPolicy } from "../types/modTypes";
import { featureFlags } from "../config/featureFlags";
import { agentMemoryService } from "./agentMemoryService";
import { CompiledPolicy, PolicyCategory } from "../types/policyTypes";

// In-memory velocity counter (resets on server restart/page reload in this demo context)
let executionCount = 0;
const VELOCITY_LIMIT_PER_MINUTE = 10; 
let lastReset = Date.now();

const checkVelocity = () => {
    const now = Date.now();
    if (now - lastReset > 60000) {
        executionCount = 0;
        lastReset = now;
    }
    if (executionCount > VELOCITY_LIMIT_PER_MINUTE) {
        throw new Error("Velocity Kill-Switch Triggered: Too many automated actions.");
    }
    executionCount++;
};

const uid = () => crypto.randomUUID();

export const autopilotExecutionService = {

    /**
     * The main entry point. Called by the Ingestion Pipeline (feedService) 
     * AFTER content is analyzed but BEFORE it is finalized.
     */
    async process(input: {
        communityId: string;
        contentId: string | number;
        contentType: "POST" | "COMMENT";
        text: string;
        authorId: string;
        analysisResults: {
            spam: number;
            toxicity: number;
            scam: number;
            linkRisk: number;
            rationale: string;
            evidence: string[];
        }
    }) {
        try {
            // 1. GLOBAL KILL-SWITCH (Feature Flag)
            if (!featureFlags.ENABLE_AUTOPILOT_EXECUTION) {
                return { executed: false, reason: "Global Kill-Switch Active" };
            }

            // 2. AGENT MEMORY CHECK (The "Brake")
            // Must happen BEFORE reading policy or calculating thresholds.
            const hesitation = await agentMemoryService.shouldHesitate(input.communityId);
            if (hesitation) {
                return { executed: false, reason: "Agent Memory Hesitation" };
            }

            // 3. LOAD COMPILED POLICY & ELIGIBILITY (The Gatekeepers)
            // Phase 4 Update: We now fetch the compiled policy which has deterministic thresholds.
            // We still need the raw ModPolicy for the State Derivation util (compatibility).
            const [rawPolicy, compiledPolicy, eligibility] = await Promise.all([
                modPolicyService.get(input.communityId),
                modPolicyService.getCompiled(input.communityId),
                autopilotEligibilityService.evaluate(input.communityId)
            ]);

            // 4. CHECK STATE
            // NOTE: Even if 'SOVEREIGN' is active in policy, this specific service
            // only executes the safety-bounded Autopilot logic (Hold only).
            const autopilotState = autopilotEligibilityService.getAutopilotState(rawPolicy, eligibility);
            
            // Allow execution if Autopilot enabled OR Sovereign enabled (Sovereign implies Autopilot+)
            const isAuthorized = autopilotState === 'ENABLED' || rawPolicy.mode === 'SOVEREIGN';
            
            if (!isAuthorized) {
                return { executed: false, reason: "Autopilot/Sovereign not enabled" };
            }

            // 5. CHECK VELOCITY (Circuit Breaker)
            checkVelocity();

            // 6. EVALUATE THRESHOLDS (Strictness) - Phase 4 Update
            // We now check if *any* category exceeds its specific HOLD threshold.
            const { spam, toxicity, scam, linkRisk } = input.analysisResults;
            const t = compiledPolicy.thresholds;

            // Check if any score hits the "HOLD" gate defined in the compiled policy
            const shouldHold = (
                spam >= t.SPAM.hold || 
                toxicity >= t.TOXICITY.hold || 
                scam >= t.SCAM.hold ||
                linkRisk >= t.LINK_RISK.hold
            );

            if (!shouldHold) {
                return { executed: false, reason: "Below strict threshold" };
            }

            // 7. IDEMPOTENCY CHECK
            const existingCases = await modCaseService.listCases(input.communityId);
            const duplicate = existingCases.find(c => c.contentId === String(input.contentId));
            if (duplicate) {
                return { executed: false, reason: "Case already exists" };
            }

            // 8. EXECUTE (The Atomic Transaction)
            const modeLabel = rawPolicy.mode === 'SOVEREIGN' ? 'Sovereign Shadow' : 'Autopilot';
            console.log(`[${modeLabel}] ⚡ EXECUTING HOLD on Content ${input.contentId}`);

            const caseId = uid();
            const actionId = uid();
            const now = Date.now();

            // A. Create the ModCase (Status: OPEN, DecidedBy: AI)
            const modCase: ModCase = {
                id: caseId,
                communityId: input.communityId,
                contentId: String(input.contentId),
                contentType: input.contentType,
                authorId: input.authorId,
                status: CaseStatus.OPEN, // Remains OPEN until human review
                suggestedAction: SuggestedAction.HOLD,
                severity: "HIGH",
                scores: { 
                    spam, toxicity, scam, linkRisk 
                },
                rationale: `[${modeLabel}] ${input.analysisResults.rationale}`,
                evidence: input.analysisResults.evidence,
                // Phase 4 Audit Fields
                policyHash: compiledPolicy.policyHash,
                policyVersion: compiledPolicy.version,
                
                createdAt: now,
                updatedAt: now,
                decidedBy: "AI" 
            };

            // B. Create the ModAction Log
            // 🔒 BOUNDARY ENFORCEMENT: Forced Actor Regression
            const modAction: ModAction = {
                id: actionId,
                caseId: caseId,
                communityId: input.communityId,
                contentId: String(input.contentId),
                action: SuggestedAction.HOLD,
                actor: "AI_MOD", 
                rationale: "Automated Hold based on high confidence violation.",
                timestamp: now
            };

            // C. Mutate Content Visibility (The "Real World" Effect)
            await feedService.applyModeration(
                input.communityId, 
                input.contentId, 
                SuggestedAction.HOLD, 
                modCase.rationale
            );

            // D. Persist Artifacts
            await Promise.all([
                modCaseService.upsertCase(input.communityId, modCase),
                modCaseService.addAction(input.communityId, modAction)
            ]);

            // E. WRITE TO AGENT MEMORY (Write-after-act)
            await agentMemoryService.recordEvent(input.communityId, 'AI_HOLD', String(input.contentId));

            return { executed: true, caseId };

        } catch (error) {
            console.error("[Autopilot] Execution Failed (Fail Open):", error);
            // ROLLBACK LOGIC would go here in a transactional DB (e.g. Firestore batch)
            return { executed: false, error };
        }
    }
};
