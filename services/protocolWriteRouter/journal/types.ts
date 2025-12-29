import type { ProtocolWriteKind } from "../types";

export type ProtocolWriteJournalEntry = {
  id: string; // stable enough to dedupe
  seasonId: string;
  kind: ProtocolWriteKind;
  communityId?: string;
  docId: string;

  local: { ok: boolean; mode: "WROTE" | "NOOP" };
  firestore: {
    ok: boolean;
    mode: "WROTE" | "NOOP_DUE_TO_LATCH" | "NOOP_DISABLED";
  };

  wroteAtMs: number; // non-hashed / non-canonical; monitoring only
};
