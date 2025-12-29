import { JoinToEarnProgram, JoinToEarnParticipant } from "./types";

const PROGRAMS_KEY = 'wizup:j2e:programs:v1';
const PARTICIPANTS_KEY = 'wizup:j2e:participants:v1';

export const joinToEarnStore = {
  getProgram(communityId: string): JoinToEarnProgram | undefined {
    const all = this.getAllPrograms();
    return all.find(p => p.communityId === communityId);
  },

  getAllPrograms(): JoinToEarnProgram[] {
    try {
      const raw = localStorage.getItem(PROGRAMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  saveProgram(program: JoinToEarnProgram) {
    const all = this.getAllPrograms();
    const idx = all.findIndex(p => p.communityId === program.communityId);
    if (idx >= 0) all[idx] = program;
    else all.push(program);
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(all));
  },

  getParticipant(userId: string, communityId: string): JoinToEarnParticipant | undefined {
    const all = this.getParticipantsForUser(userId);
    return all.find(p => p.communityId === communityId);
  },

  getParticipantsForUser(userId: string): JoinToEarnParticipant[] {
    try {
      const raw = localStorage.getItem(`${PARTICIPANTS_KEY}:${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  saveParticipant(participant: JoinToEarnParticipant) {
    const all = this.getParticipantsForUser(participant.userId);
    const idx = all.findIndex(p => p.communityId === participant.communityId);
    if (idx >= 0) all[idx] = participant;
    else all.push(participant);
    localStorage.setItem(`${PARTICIPANTS_KEY}:${participant.userId}`, JSON.stringify(all));
  }
};