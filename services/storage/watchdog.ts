import { ArtifactType } from "./types";
import { protocolReadRouter } from "./readRouter";
import { proofSinks } from "../season2TemporalLock/persistence/proofSinks";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

/**
 * 🐕 PARITY WATCHDOG
 * =================
 * Lightweight runtime checks to detect divergence at the moment of execution.
 */

export const parityWatchdog = {
  async verifyCriticalParity(args: {
    type: ArtifactType;
    seasonId: string;
    communityId?: string;
    lsKey: string;
  }): Promise<boolean> {
    const result = await protocolReadRouter.getArtifact(args);
    
    if (result.source === "LOCAL_STORAGE" && localStorage.getItem(args.lsKey)) {
        // If the router returned local while remote exists, it already logged a drift.
        // We trigger a season-level latch to be safe.
        const vid = `v_watchdog_${Date.now()}`;
        
        await proofSinks.writeNoopLatch({
            latched: true,
            reasonCode: "WATCHDOG_PARITY_FAILURE",
            violationId: vid,
            latchedAtMs: Date.now()
        }, args.seasonId);
        
        return false;
    }

    return true;
  }
};
