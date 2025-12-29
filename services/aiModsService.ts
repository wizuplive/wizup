
import { modPolicyService } from "./modPolicyService";
import { modCaseService } from "./modCaseService";
import { ModCase, CaseStatus, SuggestedAction } from "../types/modTypes";
import { classifyContent } from "./geminiService";
import { autopilotExecutionService } from "./autopilotExecutionService";
import { escalationEngineService } from "./escalationEngineService";
import { PolicyCategory } from "../types/policyTypes";
import { charterService } from "./seasonalSimulation/charterService";

type EvaluateInput = {
  communityId: string;
  contentId: string | number;
  contentType: "POST" | "COMMENT";
  text: string;
  authorId: string;
};

const uid = () => crypto.randomUUID();
const clamp01 = (n: any) => Math.max(0, Math.min(1, Number(n ?? 0)));

export const aiModsService = {
  /**
   * Core Evaluation Pipeline.
   * Season 12: Now context-aware via Community Charters.
   */
  async evaluate(input: EvaluateInput) {
    // 1. Load Compiled Policy & Local Charter
    const [policy, charter] = await Promise.all([
      modPolicyService.getCompiled(input.communityId),
      charterService.get(input.communityId)
    ]);
    
    if (policy.effectiveMode === "OFF") return;

    // 2. Build Context-Aware Analysis Prompt
    // We append the local norms to the text to ensure the classifier respects federalism.
    const federalContext = `
      COMMUNITY_CHARTER: ${charter.archetype}
      LOCAL_NORMS: ${charter.localNorms.join(", ")}
      MOD_POSTURE: ${charter.posture}
    `;
    
    // We send context-augmented text to the classifier
    const analysis = await classifyContent(`[CONTEXT: ${federalContext}]\n\n${input.text}`);
    
    const scores = {
      spam: clamp01(analysis.spam),
      toxicity: clamp01(analysis.toxicity),
      scam: clamp01(analysis.scam),
      linkRisk: clamp01(analysis.linkRisk),
    };

    // 3. Autopilot Logic (Preserved Invariants)
    const autoResult = await autopilotExecutionService.process({
        communityId: input.communityId,
        contentId: input.contentId,
        contentType: input.contentType,
        text: input.text,
        authorId: input.authorId,
        analysisResults: {
            spam: scores.spam,
            toxicity: scores.toxicity,
            scam: scores.scam,
            linkRisk: scores.linkRisk,
            rationale: analysis.rationale,
            evidence: Array.isArray(analysis.evidence) ? analysis.evidence : []
        }
    });

    if (autoResult.executed) return;

    // 4. Threshold Evaluation (Deterministic)
    let suggestedAction: SuggestedAction | undefined;
    let triggerCategory: PolicyCategory = 'TOXICITY';

    const checkCategory = (cat: PolicyCategory, score: number) => {
        const t = policy.thresholds[cat];
        if (score >= t.hold) return SuggestedAction.HOLD;
        if (score >= t.notify) return SuggestedAction.NOTE;
        if (score >= t.tag) return SuggestedAction.TAG;
        return undefined;
    };

    const actionMap = { [SuggestedAction.HOLD]: 3, [SuggestedAction.NOTE]: 2, [SuggestedAction.TAG]: 1 };
    let maxSeverity = 0;

    const evalList: { cat: PolicyCategory, score: number }[] = [
        { cat: 'SPAM', score: scores.spam },
        { cat: 'TOXICITY', score: scores.toxicity },
        { cat: 'SCAM', score: scores.scam },
        { cat: 'LINK_RISK', score: scores.linkRisk }
    ];

    for (const item of evalList) {
        const result = checkCategory(item.cat, item.score);
        if (result) {
            const severity = actionMap[result];
            if (severity > maxSeverity) {
                maxSeverity = severity;
                suggestedAction = result;
                triggerCategory = item.cat;
            }
        }
    }

    if (!suggestedAction) return;

    const severity: ModCase["severity"] =
      suggestedAction === SuggestedAction.HOLD ? "HIGH" :
      suggestedAction === SuggestedAction.NOTE ? "MED" : "LOW";

    // 5. Escalation Routing
    const escalation = escalationEngineService.evaluate(policy, triggerCategory, scores);

    // 6. Case Creation (Tagged with Protocol Context)
    const modCase: ModCase = {
      id: uid(),
      communityId: input.communityId,
      contentId: String(input.contentId),
      contentType: input.contentType,
      authorId: input.authorId,
      status: CaseStatus.OPEN,
      suggestedAction,
      severity,
      scores,
      rationale: `${analysis.rationale} (Evaluated under ${charter.archetype} charter)`,
      evidence: Array.isArray(analysis.evidence) ? analysis.evidence.slice(0, 3) : [],
      policyHash: policy.policyHash,
      policyVersion: policy.version,
      escalation,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      decidedBy: "AI",
    };

    await modCaseService.upsertCase(input.communityId, modCase);
  }
};
