import { buildSeason2ReadinessSeed, getSeason2ReadinessSeed } from "./buildSeed";
import { verifySeason2ReadinessSeed } from "./verifySeed";

/**
 * 🛠️ S2 SEED DEV BRIDGE
 */
export function installSeason2SeedDevBridge() {
  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.s2seed = {
    build: (fromId: string = "S1") => buildSeason2ReadinessSeed({ fromSeasonId: fromId }),
    verify: (fromId: string = "S1") => verifySeason2ReadinessSeed(fromId),
    inspect: (fromId: string = "S1") => getSeason2ReadinessSeed(fromId),
    
    help: () => {
      console.log("%c--- S2 Readiness Seed Tools ---", "color: #a855f7; font-weight: bold;");
      console.log("wizup.s2seed.build('S1')");
      console.log("wizup.s2seed.verify('S1')");
      console.log("wizup.s2seed.inspect('S1')");
    }
  };
}