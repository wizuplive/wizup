import { RecognitionEvent } from "./types";
import { featureFlags } from "../../config/featureFlags";

const getKey = (communityId: string) => `wizup:recognition:v1:${communityId}`;

export function listRecognitionEvents(userId?: string): RecognitionEvent[] {
  const all: RecognitionEvent[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('wizup:recognition:v1:')) {
      try {
        const events: RecognitionEvent[] = JSON.parse(localStorage.getItem(key) || '[]');
        all.push(...events);
      } catch {}
    }
  }
  
  // Deduplicate by ID
  const unique = Array.from(new Map(all.map(e => [e.id, e])).values());
  
  if (userId) return unique.filter(e => e.userId === userId);
  return unique;
}

export function listRecognitionEventsByCommunity(communityId: string, userId?: string, sinceMs?: number): RecognitionEvent[] {
  try {
    const raw = localStorage.getItem(getKey(communityId));
    if (!raw) return [];
    let events: RecognitionEvent[] = JSON.parse(raw);
    
    if (userId) events = events.filter(e => e.userId === userId);
    if (sinceMs) events = events.filter(e => e.occurredAt >= sinceMs);
    
    return events;
  } catch {
    return [];
  }
}

export const recognitionStore = {
  listRecognitionEvents: listRecognitionEventsByCommunity,

  appendRecognitionEvents(communityId: string, events: RecognitionEvent[]) {
    if (!featureFlags.ZAPS_RECOGNITION_PERSIST) return;

    const existing = this.listRecognitionEvents(communityId);
    const existingIds = new Set(existing.map(e => e.id));
    
    const newOnes = events.filter(e => !existingIds.has(e.id));
    if (newOnes.length === 0) return;

    const updated = [...existing, ...newOnes];
    // Keep reasonable history (last 200 events per community)
    if (updated.length > 200) updated.splice(0, updated.length - 200);

    localStorage.setItem(getKey(communityId), JSON.stringify(updated));
  },

  hasEvent(communityId: string, id: string): boolean {
    const existing = this.listRecognitionEvents(communityId);
    return existing.some(e => e.id === id);
  }
};
