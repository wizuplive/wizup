import { Season1CanonBundle } from "../types/canonBundleTypes";

export interface CanonBundleSource {
  getCanonBundle(args: { seasonId: string; communityId: string }): Promise<Season1CanonBundle | null>;
}