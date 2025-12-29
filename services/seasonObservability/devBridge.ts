import { seasonHealthService } from "./seasonHealthService";
import { defaultHealthSink } from "./persistence/compositeSeasonHealthSink";
import { DEV_SEASON_OBSERVABILITY } from "../../config/devFlags";
import { ENABLE_SEASON_OBSERVABILITY } from "../../config/featureFlagsSeasons";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

/**
 * 🛠️ S2 OBSERVABILITY DEV BRIDGE
 */
export function installSeasonObservabilityDevBridge() {
  if (typeof window === 'undefined') return;
  if (!DEV_SEASON_OBSERVABILITY || !ENABLE_SEASON_OBSERVABILITY) return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.buildSeasonHealth = async (seasonId: string) => {
    const artifact = await seasonHealthService.buildSeasonHealthArtifact({ seasonId });
    console.log(`%c[HEALTH] Built for ${seasonId}: ${artifact.status}`, "color: #3b82f6; font-weight: bold;");
    return artifact;
  };

  g.wizup.writeSeasonHealth = async (seasonId: string) => {
    const artifact = await seasonHealthService.buildSeasonHealthArtifact({ seasonId });
    const ok = await defaultHealthSink.write(artifact);
    
    if (ok) {
      console.log(`%c[HEALTH] Artifact Persisted: ${artifact.hashes.outputHash}`, "color: #22c55e; font-weight: bold;");
    } else {
      console.error("🚨 HEALTH IMMUTABILITY VIOLATION: Existing artifact hash differs.");
      // Generic violation emitter hook
      await violationEmitter.emit(seasonId, "S2_IMMUTABILITY_VIOLATION" as any, { 
        object: "SEASON_HEALTH", 
        proposed: artifact.hashes.outputHash 
      });
    }
    return ok;
  };

  g.wizup.inspectSeasonHealth = async (seasonId: string) => {
    return await defaultHealthSink.read(seasonId);
  };

  g.wizup.exportSeasonHealthJSON = async (seasonId: string) => {
    const artifact = await defaultHealthSink.read(seasonId);
    if (!artifact) return null;
    return {
      filename: `wizup_health_${seasonId}_${artifact.hashes.outputHash.substring(0,8)}.json`,
      jsonString: JSON.stringify(artifact, null, 2)
    };
  };

  console.log("%c[OBSERVABILITY] Season Health Layer Ready.", "color: #06b6d4; font-weight: bold;");
}
