import type { ZapsSignalEvent } from "./zapsSignals.types";

const DEDUPE_WINDOW_MS = 30_000;

export function buildDedupeKey(e: ZapsSignalEvent) {
  return [
    e.communityId,
    e.actorUserId,
    e.type,
    e.targetType ?? "NONE",
    e.targetId ?? "NONE",
  ].join("|");
}

// in-memory dedupe for demo safety
const seen = new Map<string, number>();

export function shouldAccept(e: ZapsSignalEvent) {
  const key = buildDedupeKey(e);
  const now = e.ts;
  const prev = seen.get(key);
  if (prev && now - prev < DEDUPE_WINDOW_MS) return false;
  seen.set(key, now);
  return true;
}
