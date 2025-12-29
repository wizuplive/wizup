import { DEV_SEASON1_VERIFIER } from "../../../config/devFlags";
import { featureFlags } from "../../../config/featureFlags";
import { verifySeason1CanonBundle } from "../season1CanonBundleVerifier";
import { listCanonIndexBySeason, listCanonSeasons } from "../index/canonBundleIndex";
import { LocalStorageCanonBundleSource } from "../sources/localStorageCanonBundleSource";

/**
 * 🛠️ WIZUP VERIFIER DEV BRIDGE
 */
export function installSeason1VerifierDevBridge() {
  if (!DEV_SEASON1_VERIFIER || !featureFlags.ENABLE_SEASON1_VERIFIER) return;

  const w = window as any;
  w.wizup = w.wizup || {};

  w.wizup.verifySeason1CanonBundle = verifySeason1CanonBundle;
  
  // Artifact Listing
  w.wizup.listCanonBundles = (seasonId: string) => listCanonIndexBySeason(seasonId);
  w.wizup.listCanonSeasons = () => listCanonSeasons();
  
  const localSource = new LocalStorageCanonBundleSource();
  w.wizup.inspectCanonBundle = (seasonId: string, communityId: string) => 
    localSource.getCanonBundle({ seasonId, communityId });

  w.wizup.listSeason1Violations = () => {
    const indexKey = "wizup:season1:violations:index:v1";
    const raw = localStorage.getItem(indexKey);
    if (!raw) return [];
    
    const keys: string[] = JSON.parse(raw);
    return keys.map(k => {
      const data = localStorage.getItem(k);
      return data ? JSON.parse(data) : null;
    }).filter(Boolean);
  };

  console.log("%c[VERIFIER] Season 1 Integrity Verifier & Indexer Loaded.", "color: #3b82f6; font-weight: bold;");
}
