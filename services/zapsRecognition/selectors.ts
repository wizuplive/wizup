import { listNotificationEvents } from "./notificationStore";
import { listRecognitionEvents } from "./recognitionStore";

export function getRecognitionNotifications(userId: string) {
  return listNotificationEvents(userId)
    .filter(e => e.kind === "RECOGNITION")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getRecognitionForWallet(userId: string) {
  return listRecognitionEvents()
    .filter(e => e.userId === userId)
    .sort((a, b) => b.occurredAt - a.occurredAt);
}
