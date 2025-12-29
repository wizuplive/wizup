import type { ZapsSignalEvent } from "./zapsSignals.types";

const LS_KEY = "wizup:zaps_signal_log:v1";

function safeParse(raw: string | null): ZapsSignalEvent[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ZapsSignalEvent[]) : [];
  } catch {
    return [];
  }
}

function load(): ZapsSignalEvent[] {
  try {
    return safeParse(localStorage.getItem(LS_KEY));
  } catch {
    return [];
  }
}

function save(events: ZapsSignalEvent[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(events));
  } catch {
    // ignore - no UI side effects
  }
}

export const zapsSignalLogService = {
  append(event: ZapsSignalEvent) {
    const events = load();
    events.push(event);
    save(events);
  },

  listByCommunity(communityId: string) {
    return load().filter((e) => e.communityId === communityId);
  },

  listAll() {
    return load();
  },

  // dev-only reset utility (do not wire to UI)
  __reset() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  },
};
