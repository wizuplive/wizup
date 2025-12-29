import { RecognitionEvent } from "./types";
import { NotificationEvent } from "./notificationTypes";
import { notificationStore } from "./notificationStore";
import { featureFlags } from "../../config/featureFlags";

const NOTIFY_COOLDOWN = 2 * 60 * 1000; // 2 minutes

// In-memory cooldown (reset on reload)
const lastNotifyAt = new Map<string, number>(); // key: userId

export const recognitionNotifier = {
  /**
   * Emits notification events based on derived recognition.
   */
  async emitRecognitionNotifications(events: RecognitionEvent[]): Promise<void> {
    if (!featureFlags.ZAPS_RECOGNITION_NOTIFY) return;

    const now = Date.now();
    const userGroups = new Map<string, RecognitionEvent[]>();

    // Group by user
    events.forEach(e => {
      const group = userGroups.get(e.userId) || [];
      group.push(e);
      userGroups.set(e.userId, group);
    });

    for (const [userId, userEvents] of userGroups) {
      const last = lastNotifyAt.get(userId) || 0;
      if (now - last < NOTIFY_COOLDOWN) continue;

      // Emit one notification for the first new event (v1 merging strategy)
      const first = userEvents[0];
      const notification: NotificationEvent = {
        id: `notif_${first.id}`,
        userId,
        communityId: first.communityId,
        kind: "RECOGNITION",
        createdAt: now,
        payload: {
          recognitionId: first.id,
          type: first.type,
          reason: first.reason,
          sourceRef: first.sourceRef
        }
      };

      if (!notificationStore.hasNotification(userId, notification.id)) {
        notificationStore.appendNotificationEvents(userId, [notification]);
        lastNotifyAt.set(userId, now);
      }
    }
  }
};
