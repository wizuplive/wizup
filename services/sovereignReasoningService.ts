
import { ModCase, EscalationLane, ConsensusAnalysis, ConsensusStatus } from "../types/modTypes";
import { SovereignReasoningArtifact, ReasoningSignalChip } from "../types/sovereignReasoningTypes";
import { CompiledPolicy } from "../types/policyTypes";

/**
 * SOVEREIGN REASONING SERVICE v4
 * ==============================
 * Now includes Agent-to-Agent Consensus Simulation.
 * 
 * Rules:
 * 1. No network calls.
 * 2. No storage writes.
 * 3. Deterministic output based on inputs.
 * 4. Qualitative only (no numbers).
 */

export const sovereignReasoningService = {

  buildReasoning(
    modCase: ModCase,
    policy?: CompiledPolicy // Optional context
  ): SovereignReasoningArtifact | null {
    
    // Fail-Safe: If no escalation data, we can't reason effectively in v0.
    if (!modCase.escalation) return null;

    const lane = modCase.escalation.lane;
    const scores = modCase.scores;

    // Detect implied category from scores (Max score wins)
    const isSpamOrScam = scores.scam > 0.6 || scores.linkRisk > 0.6 || scores.spam > 0.6;
    const isToxicity = scores.toxicity > 0.6;

    // --- TEMPLATE SELECTION LOGIC ---

    // TEMPLATE A: Potential Manipulation (Priority + Scam/Link/Spam)
    if (lane === EscalationLane.PRIORITY_REVIEW || (lane === EscalationLane.NORMAL_REVIEW && isSpamOrScam)) {
      return {
        headline: "Potential manipulation pattern",
        summary: "This content matches patterns commonly used to redirect or mislead. Action was taken to prevent exposure while awaiting confirmation.",
        signals: [
          "Off-platform push",
          "Promise framing",
          "Urgency language"
        ],
        uncertainty: "Intent cannot be confirmed from text alone. Context may be legitimate.",
        humanNext: "Confirm whether the destination and claim are verifiable inside this community’s norms.",
        policyBasis: `Policy intent: ${policy?.thresholds?.SCAM ? 'Active' : 'Standard'}. Protections: Fraud, Links.`,
        scopeNote: "This explanation did not affect the decision."
      };
    }

    // TEMPLATE B: Integrity Risk (Sensitive + Toxicity)
    if (lane === EscalationLane.SENSITIVE_REVIEW || (lane === EscalationLane.NORMAL_REVIEW && isToxicity)) {
      return {
        headline: "Conversation integrity risk",
        summary: "Language appears likely to escalate conflict. Action was taken to reduce harm while preserving the option to restore.",
        signals: [
          "Personal targeting",
          "Dismissive tone",
          "Provocation"
        ],
        uncertainty: "Tone can be cultural or sarcastic; intent may be misread.",
        humanNext: "Check if this is directed at a person, and whether it violates community standards.",
        policyBasis: `Policy intent: ${policy?.thresholds?.TOXICITY ? 'Active' : 'Standard'}. Protections: Harassment.`,
        scopeNote: "This explanation did not affect the decision."
      };
    }

    // TEMPLATE C: Context Required (Normal / Default)
    // Fallback for everything else
    return {
      headline: "Context required",
      summary: "Signals were mixed. No automated intervention is appropriate without human review.",
      signals: [
        "Mixed cues",
        "Possible misunderstanding"
      ],
      uncertainty: "Meaning depends on thread context.",
      humanNext: "Review surrounding replies before deciding.",
      policyBasis: "Policy intent: Standard. Protections: General.",
      scopeNote: "This explanation did not affect the decision."
    };
  },

  /**
   * V4: AGENT CONSENSUS SIMULATION
   * Determines if the "invisible agents" agreed or disagreed.
   * This drives the Consensus Strip UI.
   */
  analyzeConsensus(modCase: ModCase): ConsensusAnalysis {
    const scores = modCase.scores;
    const lane = modCase.escalation?.lane;

    // SCENARIO 1: CONTESTED (High disagreement or Sensitive)
    // Occurs if multiple high scores exist or lane is Sensitive
    if (lane === EscalationLane.SENSITIVE_REVIEW || (scores.toxicity > 0.7 && scores.spam > 0.7)) {
        return {
            status: 'CONTESTED',
            headline: "Multiple perspectives detected",
            signals: ["Policy boundary case", "Context dependent"],
            perspectives: [
                { id: '1', focus: 'Integrity Layer', observation: 'High probability of conflict escalation.', leaning: 'RISK' },
                { id: '2', focus: 'Context Layer', observation: 'Keywords may be reclaimed/slang within this group.', leaning: 'NEUTRAL' },
                { id: '3', focus: 'Safety Layer', observation: 'Standard harassment safeguards triggered.', leaning: 'RISK' }
            ]
        };
    }

    // SCENARIO 2: UNCERTAIN (Medium scores or Priority)
    // Occurs if scores are borderline (0.5 - 0.7)
    const isBorderline = Object.values(scores).some(s => s > 0.5 && s < 0.8);
    if (lane === EscalationLane.PRIORITY_REVIEW || isBorderline) {
        return {
            status: 'UNCERTAIN',
            headline: "Ambiguous signal patterns",
            signals: ["Intent unclear", "Potential false positive"],
            perspectives: [
                { id: '1', focus: 'Pattern Matcher', observation: 'Resembles known spam structures but lacks specific payloads.', leaning: 'RISK' },
                { id: '2', focus: 'Reputation', observation: 'Author history is generally clean.', leaning: 'SAFE' }
            ]
        };
    }

    // SCENARIO 3: ALIGNED (Default)
    // High confidence, single clear signal
    return {
        status: 'ALIGNED',
        headline: "System consensus achieved",
        signals: ["High confidence", "Pattern confirmed"],
        perspectives: [
            { id: '1', focus: 'Primary Detection', observation: 'Clear violation of established thresholds.', leaning: 'RISK' },
            { id: '2', focus: 'Context Layer', observation: 'No mitigating context found.', leaning: 'RISK' }
        ]
    };
  }
};
