export interface NotificationEvent {
  id: string;
  userId: string;
  communityId: string;
  kind: "RECOGNITION";
  createdAt: number;

  payload: {
    recognitionId: string;
    type: string;   // RecognitionType
    reason: string; // RecognitionReason
    sourceRef?: { kind: string; id: string };
  };
}
