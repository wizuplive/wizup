import { listCanonIndexBySeason, listCanonSeasons } from "../index/canonBundleIndex";
import { LocalStorageCanonBundleSink } from "../sinks/localStorageCanonBundleSink";

export function installSeason1CanonBundleDevBridge(args: {
  enabled: boolean; // explicit local toggle
}) {
  try {
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (!isDev) return;
    if (!args.enabled) return;

    const g: any = globalThis as any;
    g.wizup = g.wizup || {};

    const local = new LocalStorageCanonBundleSink();

    g.wizup.listCanonBundles = (seasonId: string) => listCanonIndexBySeason(seasonId);
    g.wizup.listCanonBundleSeasons = () => listCanonSeasons();
    g.wizup.inspectCanonBundle = (seasonId: string, communityId: string) => local.read(seasonId, communityId);
    
    console.log("%c[CANON] Season 1 Bundle Indexer Tools Loaded.", "color: #a855f7; font-weight: bold;");
  } catch {
    // swallow
  }
}
