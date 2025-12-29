export type ShadowWriteParityFinding = {
  seasonId: string;
  missingInFirestore: Array<{ kind: string; docId: string; communityId?: string }>;
  localWriteFailures: Array<{ kind: string; docId: string; communityId?: string }>;
  latchedSeasons: string[];
  checkedAtMs: number;
  verdict: "PASS" | "WARN" | "BLOCK";
  stats: {
    entriesSeen: number;
    expectedShadowWrites: number;
    missingShadowWrites: number;
  };
};
