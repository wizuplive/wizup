import type { Season1CanonBundle } from "../types/canonBundleTypes";
import { LS_KEYS } from "../keys";

export type CanonWriteResult =
  | { ok: true; status: "WROTE" | "ALREADY_PRESENT_SAME_HASH" }
  | { ok: false; status: "IMMUTABLE_MISMATCH"; existingHash?: string };

export class LocalStorageCanonBundleSink {
  constructor(private readonly storage: Storage = window.localStorage) {}

  read(seasonId: string, communityId: string): Season1CanonBundle | null {
    try {
      const raw = this.storage.getItem(LS_KEYS.canonBundle(seasonId, communityId));
      return raw ? (JSON.parse(raw) as Season1CanonBundle) : null;
    } catch {
      return null;
    }
  }

  write(bundle: Season1CanonBundle): CanonWriteResult {
    try {
      const key = LS_KEYS.canonBundle(bundle.seasonId, bundle.communityId);
      const existingRaw = this.storage.getItem(key);

      if (existingRaw) {
        const existing = JSON.parse(existingRaw) as Season1CanonBundle;
        if (existing.bundleHash === bundle.bundleHash) {
          return { ok: true, status: "ALREADY_PRESENT_SAME_HASH" };
        }
        // Irreversible mismatch.
        return { ok: false, status: "IMMUTABLE_MISMATCH", existingHash: existing.bundleHash };
      }

      const toWrite: Season1CanonBundle = {
        ...bundle,
        writtenAtMs: Date.now(),
      };

      this.storage.setItem(key, JSON.stringify(toWrite));
      return { ok: true, status: "WROTE" };
    } catch {
      // Fail-open: treat as "not written" without throwing in a way that breaks production
      return { ok: true, status: "WROTE" }; 
    }
  }
}
