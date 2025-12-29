/**
 * 🔒 SAFE_NOOP LATCH
 * =================
 */

const SAFE_NOOP_LATCH_KEY = "WIZUP::PROTOCOL::SAFE_NOOP_LATCH::v1::global";

type SafeNoopLatchState = {
  latched: boolean;
  reason?: string;
  latchedAtMs?: number;
};

let mem: SafeNoopLatchState = { latched: false };

export function setSafeNoopLatch(args: { reason: string; persist?: boolean }) {
  mem = { latched: true, reason: args.reason, latchedAtMs: Date.now() };

  // Optional persistence for operator inspection (still not a UI read path).
  if (args.persist) {
    try {
      window?.localStorage?.setItem(SAFE_NOOP_LATCH_KEY, JSON.stringify(mem));
    } catch {
      // fail-open
    }
  }
}

export function getSafeNoopLatch(): SafeNoopLatchState {
  // Prefer memory (fast, deterministic in-session)
  if (mem.latched) return mem;

  // Optional: recover persisted latch (if page reloads)
  try {
    const raw = window?.localStorage?.getItem(SAFE_NOOP_LATCH_KEY);
    if (!raw) return mem;
    const parsed = JSON.parse(raw);
    if (parsed?.latched === true) {
      mem = parsed;
      return mem;
    }
  } catch {
    // ignore
  }
  return mem;
}
