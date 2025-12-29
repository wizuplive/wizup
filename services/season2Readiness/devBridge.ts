import { candidateBuilder } from "./builder";
import { acknowledgementService } from "./acknowledgement";
import { isSeason2Ready } from "./readinessGate";
import { candidateSink } from "./persistence";

/**
 * 🛠️ S2 READINESS DEV BRIDGE
 */
export function installSeason2DevBridge() {
  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.s2 = {
    buildCandidate: (s2Id: string, s1Id: string = "S1") => 
      candidateBuilder.buildCandidate(s2Id, s1Id),
    
    acknowledge: (s2Id: string, note?: string) => 
      acknowledgementService.acknowledge({ season2Id: s2Id, note }),
    
    getStatus: (s2Id: string) => isSeason2Ready(s2Id),
    
    inspect: (s2Id: string) => candidateSink.read(s2Id),

    help: () => {
      console.log("%c--- S2 Readiness Pipeline ---", "color: #06b6d4; font-weight: bold;");
      console.log("wizup.s2.buildCandidate('S2_2026Q1')");
      console.log("wizup.s2.acknowledge('S2_2026Q1', 'Params verified against S1 end-state.')");
      console.log("wizup.s2.getStatus('S2_2026Q1')");
    }
  };
}
