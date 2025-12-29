import type { ProtocolReadRouter } from "../protocolReadRouter";

export type CanonBundleIndex = {
  seasonId: string;
  // canonical community list for that season
  communityIds: string[];
  // optional metadata
  updatedAtMs?: number;
};

function normalizeIndex(raw: any, seasonId: string): CanonBundleIndex {
  const ids: string[] =
    Array.isArray(raw?.communityIds) ? raw.communityIds.slice() :
    Array.isArray(raw) ? raw.slice() :
    [];

  return {
    seasonId,
    communityIds: Array.from(new Set(ids)).sort(),
    updatedAtMs: typeof raw?.updatedAtMs === "number" ? raw.updatedAtMs : undefined,
  };
}

/**
 * Reads canon bundle index for seasonId.
 * Preference: localStorage index (it exists in hybrid demo), otherwise FS if available.
 */
export async function readCanonBundleIndex(args: {
  router: ProtocolReadRouter;
  seasonId: string;
}): Promise<CanonBundleIndex> {
  const { router, seasonId } = args;

  // Try LS/FS through router
  const res = await router.read<any>({ kind: "S1_CANON_BUNDLE_INDEX", seasonId });
  if (res.value) return normalizeIndex(res.value, seasonId);

  // Fallback: if index is absent, we must not guess.
  return { seasonId, communityIds: [] };
}
