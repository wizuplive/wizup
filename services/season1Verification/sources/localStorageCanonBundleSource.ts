import { CanonBundleSource } from "./canonBundleSource";
import { Season1CanonBundle } from "../types/canonBundleTypes";
import { LS_KEYS } from "../keys";

/**
 * 💾 LOCAL STORAGE CANON BUNDLE SOURCE
 */
export class LocalStorageCanonBundleSource implements CanonBundleSource {
  async getCanonBundle(args: { seasonId: string; communityId: string }): Promise<Season1CanonBundle | null> {
    try {
      const key = LS_KEYS.canonBundle(args.seasonId, args.communityId);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as Season1CanonBundle : null;
    } catch {
      return null;
    }
  }
}
