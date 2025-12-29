
import { featureFlags } from "../../../config/featureFlags";
import { zapsTreasuryService } from "../../zapsTreasury/zapsTreasuryService";
import { zapsSignalEmitter } from "../../zapsSignals/zapsSignalEmitter";
import { joinToEarnStore } from "./joinToEarnStore";
import { JoinToEarnParticipant, JoinToEarnProgram, JoinToEarnSignalType } from "./types";
import { ZapsSignalEvent } from "../../zapsSignals/types/zapsSignals.types";
import { freezeProtocol } from "../../zapsTreasury/freezeProtocol";
import { seasonGatekeeper } from "../../seasonalGovernance/seasonGatekeeper";

/**
 * 🌅 JOIN-TO-EARN SERVICE v1
 * ===========================
 * Principle: "Joining is free. Belonging is earned."
 */

export const joinToEarnService = {
  
  /**
   * Process incoming signals to check for Join-to-Earn eligibility.
   * COMPLIANCE: One-way, write-only signals. No dopamine loops.
   */
  async processSignal(event: ZapsSignalEvent) {
    if (!featureFlags.JOIN_TO_EARN_V1) return;

    // --- SEASON GATE ENFORCEMENT ---
    // Note: Assuming Season 1 simulation
    try {
      const result = await seasonGatekeeper.assertSeasonAllowed({ seasonId: "S1" });
      if (result.constraints?.overrides.exclusions?.communities?.includes(event.communityId)) {
          return; // Blocked by moral constraint
      }
    } catch {
      // Proceed if no gate/S0
    }

    const program = joinToEarnStore.getProgram(event.communityId);
    if (!program || !program.isActive || program.isPaused) return;

    const treasury = zapsTreasuryService.getSummary(event.communityId);
    if (treasury.isFrozen) return;

    const participant = joinToEarnStore.getParticipant(event.actorUserId, event.communityId);

    // 1. Initial Join Check
    if (event.type === 'COMMUNITY_JOIN') {
      await this.handleNewJoin(event.actorUserId, program);
      return;
    }

    if (!participant) return;

    // 2. Time-Gated Signal Processing
    const now = Date.now();
    const daysSinceJoin = (now - participant.joinedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceJoin >= 3 && !participant.signalsClaimed.includes("STAY")) {
      this.emitJ2ESignal(participant, "STAY");
    }

    if (daysSinceJoin >= 7 && !participant.signalsClaimed.includes("PARTICIPATE")) {
      const isMeaningful = event.type === 'COMMENT_CREATED' || event.type === 'GOVERNANCE_VOTE';
      if (isMeaningful) {
        this.emitJ2ESignal(participant, "PARTICIPATE");
      }
    }

    // 3. Positive Receipt
    if (event.type === 'UPVOTE_RECEIVED' && event.targetUserId === participant.userId) {
       if (!participant.signalsClaimed.includes("POSITIVE_RECEIPT")) {
          this.emitJ2ESignal(participant, "POSITIVE_RECEIPT");
       }
    }

    // 4. Stewardship
    if (event.type === 'MODERATION_ACTION' || event.type === 'GOVERNANCE_PROPOSAL') {
       if (!participant.signalsClaimed.includes("STEWARDSHIP")) {
          this.emitJ2ESignal(participant, "STEWARDSHIP");
       }
    }
  },

  async handleNewJoin(userId: string, program: JoinToEarnProgram) {
    const treasury = zapsTreasuryService.getSummary(program.communityId);
    if (treasury.isFrozen || treasury.balance < 1000) {
      return;
    }

    const now = Date.now();
    if (now - program.weekStartedAt > 7 * 24 * 60 * 60 * 1000) {
      program.weekStartedAt = now;
      program.currentWeekCount = 0;
    }

    if (program.currentWeekCount >= program.weeklyJoinLimit) {
      this.autoPause(program, "Weekly join limit reached");
      return;
    }

    if (program.currentWeekCount > 50 && (now - program.weekStartedAt < 3600000)) {
        await freezeProtocol.initiateFreeze(program.communityId, 'SYSTEM', 'Abnormal Join Velocity');
        return;
    }

    const participant: JoinToEarnParticipant = {
      userId,
      communityId: program.communityId,
      joinedAt: now,
      signalsClaimed: ["JOIN"],
      lastSignalAt: now
    };

    program.currentWeekCount++;
    joinToEarnStore.saveProgram(program);
    joinToEarnStore.saveParticipant(participant);

    this.emitJ2ESignal(participant, "JOIN");
  },

  getProgram(communityId: string) {
    return joinToEarnStore.getProgram(communityId);
  },

  emitJ2ESignal(participant: JoinToEarnParticipant, type: JoinToEarnSignalType) {
    participant.signalsClaimed.push(type);
    participant.lastSignalAt = Date.now();
    joinToEarnStore.saveParticipant(participant);

    zapsSignalEmitter.emit({
      type: 'COMMUNITY_JOIN',
      actorUserId: participant.userId,
      communityId: participant.communityId,
      source: 'COMMUNITY',
      meta: { j2eType: type, version: "v1" }
    });

    console.log(`%c[J2E] Signal Captured: ${type} for ${participant.userId} in ${participant.communityId}`, "color: #8b5cf6; font-weight: bold;");
  },

  autoPause(program: JoinToEarnProgram, reason: string) {
    program.isPaused = true;
    program.autoPauseTriggered = true;
    joinToEarnStore.saveProgram(program);
    console.warn(`%c[J2E] Auto-Pause triggered in ${program.communityId}: ${reason}`, "color: #ef4444; font-weight: bold;");
  }
};
