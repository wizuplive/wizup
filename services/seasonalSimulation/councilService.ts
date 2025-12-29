
import { 
  CouncilMember, 
  CouncilVote, 
  CouncilDecisionRecord, 
  CouncilSession, 
  CouncilVerdict,
  CouncilRole
} from "../../types/councilTypes";
import { experimentRegistryService } from "./experimentRegistryService";
import { driftLogService } from "../driftLogService";

const COUNCIL_KEY = "wizup_council_registry_v2";
const SESSIONS_KEY = "wizup_council_sessions_v2";
const DECISIONS_KEY = "wizup_council_decisions_v2";

/**
 * 🏛️ SEASON 2 REVIEW COUNCIL SERVICE
 * ===================================
 * Manages the custodial review of Season 2 experiments.
 * 
 * INVARIANTS:
 * 1. 3/4 majority required for ACCEPT.
 * 2. External Observer cannot vote.
 * 3. Decisions are immutable once sealed.
 * 4. No influence on live parameters.
 */

export const councilService = {

  /**
   * Seed the Council for Season 2.
   * Asymmetric seats as per specification.
   */
  initCouncil() {
    const existing = localStorage.getItem(COUNCIL_KEY);
    if (existing) return;

    const initialMembers: CouncilMember[] = [
      { id: "c_01", name: "System Architect", role: "FOUNDER_ARCHITECT", canVote: true, joinedAt: Date.now() },
      { id: "c_02", name: "Lead Steward", role: "COMMUNITY_STEWARD", canVote: true, joinedAt: Date.now() },
      { id: "c_03", name: "Creator Advocate", role: "CREATOR_REPRESENTATIVE", canVote: true, joinedAt: Date.now() },
      { id: "c_04", name: "Trust & Safety Lead", role: "NEUTRAL_MODERATOR", canVote: true, joinedAt: Date.now() },
      { id: "c_05", name: "Protocol Auditor", role: "EXTERNAL_OBSERVER", canVote: false, joinedAt: Date.now() }
    ];

    localStorage.setItem(COUNCIL_KEY, JSON.stringify(initialMembers));
    console.log("%c[COUNCIL] Season 2 Review Council Seated.", "color: #3b82f6; font-weight: bold;");
  },

  getMembers(): CouncilMember[] {
    return JSON.parse(localStorage.getItem(COUNCIL_KEY) || '[]');
  },

  /**
   * Open a review session for a completed or aborted experiment.
   */
  openSession(experimentId: string) {
    const registry = experimentRegistryService.getRegistry();
    const exp = registry.find(e => e.experimentId === experimentId);

    if (!exp || (exp.status !== 'COMPLETED' && exp.status !== 'ABORTED')) {
      throw new Error(`[COUNCIL] Experiment ${experimentId} is not ready for review.`);
    }

    const sessions = this.getSessions();
    if (sessions.find(s => s.experimentId === experimentId)) return;

    const newSession: CouncilSession = {
      experimentId,
      status: 'OPEN',
      votes: [],
      startedAt: Date.now()
    };

    sessions.push(newSession);
    this.saveSessions(sessions);
    console.log(`%c[COUNCIL] Review Session opened for: ${experimentId}`, "color: #8b5cf6; font-weight: bold;");
  },

  /**
   * Process a vote from a council member.
   */
  castVote(experimentId: string, memberId: string, verdict: CouncilVerdict, rationale: string) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.experimentId === experimentId);
    const member = this.getMembers().find(m => m.id === memberId);

    if (!session || session.status === 'SEALED') throw new Error("Session closed.");
    if (!member || !member.canVote) throw new Error("Member not authorized to vote.");

    const vote: CouncilVote = {
      memberId,
      verdict,
      rationale,
      timestamp: Date.now()
    };

    session.votes = session.votes.filter(v => v.memberId !== memberId);
    session.votes.push(vote);
    this.saveSessions(sessions);
  },

  /**
   * Finalize the decision based on voting mechanics.
   */
  sealDecision(experimentId: string, criteria: CouncilDecisionRecord['criteriaCheck']) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.experimentId === experimentId);
    if (!session || session.status === 'SEALED') return;

    const votingMembers = this.getMembers().filter(m => m.canVote);
    if (session.votes.length < votingMembers.length) {
      throw new Error("[COUNCIL] Awaiting more votes before sealing.");
    }

    // Tally Logic
    const acceptCount = session.votes.filter(v => v.verdict === 'ACCEPT').length;
    const rejectCount = session.votes.filter(v => v.verdict === 'REJECT').length;
    
    // VERDICT MECHANICS: 3/4 Majority for ACCEPT.
    let finalVerdict: CouncilVerdict = 'DEFER';
    if (acceptCount >= 3) {
      finalVerdict = 'ACCEPT';
    } else if (rejectCount >= 2) {
      finalVerdict = 'REJECT';
    }

    // Safety Override: Negative criteria answers force REJECT/DEFER
    if (!criteria.noInvariantsViolated || !criteria.perceivedFairnessMet) {
      finalVerdict = 'REJECT';
    }

    const signatories = session.votes.map(v => {
      const m = this.getMembers().find(mem => mem.id === v.memberId)!;
      return {
        memberId: v.memberId,
        role: m.role,
        signature: driftLogService.hash(`${experimentId}:${finalVerdict}:${v.memberId}`)
      };
    });

    const decision: CouncilDecisionRecord = {
      experimentId,
      verdict: finalVerdict,
      rationale: session.votes.map(v => `${v.memberId}: ${v.rationale}`).join(" | "),
      signatories,
      criteriaCheck: criteria,
      sealedAt: Date.now()
    };

    const decisions = this.getDecisions();
    decisions.push(decision);
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));

    session.status = 'SEALED';
    this.saveSessions(sessions);

    console.log(`%c[COUNCIL] DECISION SEALED for ${experimentId}: ${finalVerdict}`, "color: #22c55e; font-weight: bold;");
    return decision;
  },

  getSessions(): CouncilSession[] {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  },

  // Removed invalid 'private' modifier for object literal method to fix "Modifiers cannot appear here" errors
  saveSessions(sessions: CouncilSession[]) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getDecisions(): CouncilDecisionRecord[] {
    return JSON.parse(localStorage.getItem(DECISIONS_KEY) || '[]');
  }
};

// Auto-init Council
if (typeof window !== 'undefined') {
  councilService.initCouncil();
}
