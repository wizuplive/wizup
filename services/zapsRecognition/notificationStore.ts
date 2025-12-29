import { NotificationEvent } from "./notificationTypes";

const getKey = (userId: string) => `wizup:notifications:v1:${userId}`;

export function listNotificationEvents(userId: string, sinceMs?: number): NotificationEvent[] {
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return [];
    let events: NotificationEvent[] = JSON.parse(raw);
    
    if (sinceMs) events = events.filter(e => e.createdAt >= sinceMs);
    
    return events;
  } catch {
    return [];
  }
}

export const notificationStore = {
  listNotificationEvents,

  appendNotificationEvents(userId: string, events: NotificationEvent[]) {
    const existing = this.listNotificationEvents(userId);
    const existingIds = new Set(existing.map(e => e.id));
    
    const newOnes = events.filter(e => !existingIds.has(e.id));
    if (newOnes.length === 0) return;

    const updated = [...existing, ...newOnes];
    // Last 50 notifications per user
    if (updated.length > 50) updated.splice(0, updated.length - 50);

    localStorage.setItem(getKey(userId), JSON.stringify(updated));
  },

  hasNotification(userId: string, id: string): boolean {
    const existing = this.listNotificationEvents(userId);
    return existing.some(e => e.id === id);
  }
};
