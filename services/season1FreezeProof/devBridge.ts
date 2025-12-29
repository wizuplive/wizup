import { season1FreezeProof } from "./season1FreezeProof";
import { freezeEnforcer } from "./freezeEnforcer";

export function installFreezeDevBridge() {
  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.verifySeason1Freeze = async (seasonId: string) => {
    console.group(`%c[AUDIT] Verifying Season 1 Protocol Freeze: ${seasonId}`, "color: #3b82f6; font-weight: bold;");
    
    const isFrozen = freezeEnforcer.isSeason1Frozen(seasonId);
    console.log("Current Freeze State:", isFrozen ? "FROZEN ❄️" : "ACTIVE 🟢");

    const result = await season1FreezeProof.assertSeason1NotFrozenOrNoop(seasonId);
    console.log("Guard Assertion Result:", result.allowed ? "ALLOWED ✅" : "BLOCKED ❌");

    console.groupEnd();
  };
}
