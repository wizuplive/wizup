
/**
 * 🔒 PHASE 2.2C FREEZE: AGENT MEMORY v0
 * =====================================
 * This service implements the "Brake, Not Brain" invariant.
 * 
 * CONSTITUTIONAL RULES:
 * 1. SCOPE: Per-Community ONLY. No cross-community leakage.
 * 2. ROLE: Defensive Gating ONLY. Does not influence action choice.
 * 3. RETENTION: Short-term (TTL). Resets on human override.
 * 
 * DO NOT add long-term scoring, user profiling, or preference learning here.
 * See docs/PHASE_2_2C_FREEZE.md for full invariants.
 */

import { AgentMemoryState, AgentMemoryEventType } from "../types/agentMemoryTypes";
import { dataService } from "./dataService";

// TTL Configuration (Memory Lifetime)
const TTL_MAP: Record<AgentMemoryEventType, number> = {
  AI_HOLD: 10 * 60 * 1000,       // 10 minutes (Cooldown impact)
  HUMAN_RESTORE: 30 * 60 * 1000, // 30 minutes (Override impact - High sensitivity)
  HUMAN_CONFIRM: 30 * 60 * 1000, // 30 minutes
  BURST_ACTIVITY: 60 * 1000      // 1 minute
};

class AgentMemoryService {
  // In-memory store: CommunityID -> Memory State
  // This is local to the execution layer, per the spec.
  private memoryStore: Map<string, AgentMemoryState> = new Map();

  // PHASE 3: ASYNC HYDRATION
  // We must now allow fetching memory from Firestore if enabled.
  private async getMemory(communityId: string): Promise<AgentMemoryState> {
    if (!this.memoryStore.has(communityId)) {
        // Try to hydrate from DataService (which checks Firestore if flag is ON)
        const events = await dataService.getAgentMemory(communityId);
        this.memoryStore.set(communityId, { communityId, events: events || [] });
    }
    return this.memoryStore.get(communityId)!;
  }

  // Lazy cleanup: Remove expired events whenever we access memory
  private cleanup(mem: AgentMemoryState) {
    const now = Date.now();
    mem.events = mem.events.filter(e => {
      const ttl = TTL_MAP[e.type] || 60000;
      return (now - e.timestamp) < ttl;
    });
  }

  /**
   * Write-after-event: Record an action or signal.
   * This is called AFTER a successful Autopilot action or a Human intervention.
   */
  async recordEvent(communityId: string, type: AgentMemoryEventType, contentId?: string) {
    const mem = await this.getMemory(communityId);
    this.cleanup(mem);
    
    // If Human Restores, we wipe recent AI_HOLD momentum to enforce "Human Supremacy"
    if (type === 'HUMAN_RESTORE') {
        mem.events = mem.events.filter(e => e.type !== 'AI_HOLD');
        console.log(`[Agent Memory] Human Override detected. Wiping AI momentum for ${communityId}.`);
    }

    const event = {
      id: crypto.randomUUID(),
      type,
      contentId,
      timestamp: Date.now()
    };

    mem.events.push(event);
    
    // Shadow Persistence: Mirror event to Firestore for analysis
    // NOTE: This also serves as the "Primary Write" if Firestore Read is enabled later.
    dataService.shadowWriteMemoryEvent(communityId, event);
  }

  /**
   * Read-before-act: Should the agent hesitate?
   * Returns TRUE if we should fall back to Assist Mode (Fail Open).
   * This check happens BEFORE any execution logic.
   * 
   * UPDATED: Now ASYNC to support Firestore reads.
   */
  async shouldHesitate(communityId: string): Promise<boolean> {
    const mem = await this.getMemory(communityId);
    this.cleanup(mem);
    const now = Date.now();

    // PHASE 3: SHADOW READ VERIFICATION
    // Verify that our in-memory understanding of "safety" matches the persistent record.
    // (Non-blocking check)
    dataService.verifyAgentMemory(communityId, mem);

    // Rule 1: Cooldown (Recent AI Action?)
    // If agent acted in the last 5 minutes, hesitate to prevent rapid-fire moderation.
    // This forces a natural, non-robotic pace.
    const recentAiActions = mem.events.filter(e => 
      e.type === 'AI_HOLD' && (now - e.timestamp) < (5 * 60 * 1000) 
    );
    if (recentAiActions.length >= 1) {
      console.log(`[Agent Memory] Hesitating: Cooldown active (Recent AI Action).`);
      return true;
    }

    // Rule 2: Override Sensitivity (Recent Human Correction?)
    // If a human restored content recently, reduce confidence immediately.
    // "Human disagreement wipes momentum."
    const recentOverrides = mem.events.filter(e => 
      e.type === 'HUMAN_RESTORE'
    );
    if (recentOverrides.length > 0) {
      console.log(`[Agent Memory] Hesitating: Sensitivity active (Recent Human Override).`);
      return true;
    }

    // Rule 3: Burst Awareness (Is chaos happening?)
    // If > 5 significant events in last minute, pause to avoid cascading loops.
    const burstWindowEvents = mem.events.filter(e => (now - e.timestamp) < 60000);
    if (burstWindowEvents.length >= 5) {
       console.log(`[Agent Memory] Hesitating: Burst Activity detected.`);
       return true;
    }

    return false;
  }
}

export const agentMemoryService = new AgentMemoryService();
