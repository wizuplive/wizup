import type { ProtocolWriteJournalEntry } from "./types";
import { writeJournalKey } from "./keys";

/**
 * 📖 WRITE JOURNAL STORAGE ACCESSOR
 */
export function getJournalStorage(): Storage | undefined {
  try {
    return (globalThis as any).__WIZUP_TEST_STORAGE__ ?? window?.localStorage;
  } catch {
    return (globalThis as any).__WIZUP_TEST_STORAGE__ ?? undefined;
  }
}

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function appendWriteJournalEntry(entry: ProtocolWriteJournalEntry, maxEntries = 2000): void {
  try {
    const storage = getJournalStorage();
    if (!storage) return;

    const key = writeJournalKey();
    const existing = safeJson<ProtocolWriteJournalEntry[]>(storage.getItem(key), []);

    // Dedup by id
    if (existing.some((e) => e.id === entry.id)) return;

    const next = [entry, ...existing].slice(0, Math.max(1, maxEntries));
    storage.setItem(key, JSON.stringify(next));
  } catch {
    // fail-open
  }
}

export function listWriteJournalEntries(): ProtocolWriteJournalEntry[] {
  try {
    const storage = getJournalStorage();
    if (!storage) return [];
    return safeJson<ProtocolWriteJournalEntry[]>(storage.getItem(writeJournalKey()), []);
  } catch {
    return [];
  }
}

export function clearWriteJournal(): void {
  try {
    const storage = getJournalStorage();
    if (!storage) return;
    storage.removeItem(writeJournalKey());
  } catch {
    // noop
  }
}
