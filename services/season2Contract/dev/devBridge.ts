import { buildSeason2CandidateContract } from "../season2CandidateContractBuilder";
import { acknowledgeSeason2Ready } from "../architectAckService";
import { isSeason2Ready } from "../isSeason2Ready";
import { S2_INDEX_KEY } from "../keys";

/**
 * 🛠️ S2 CONTRACT DEV BRIDGE
 */
export function installSeason2ContractDevBridge() {
  if (typeof window === 'undefined') return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.s2contract = {
    build: buildSeason2CandidateContract,
    acknowledge: acknowledgeSeason2Ready,
    isReady: isSeason2Ready,
    list: () => {
      const raw = localStorage.getItem(S2_INDEX_KEY());
      return raw ? JSON.parse(raw) : [];
    },
    help: () => {
      console.log("%c--- S2 Contract Builder Tools ---", "color: #06b6d4; font-weight: bold;");
      console.log("wizup.s2contract.build({ prevSeasonId: 'S1' })");
      console.log("wizup.s2contract.acknowledge({ seasonId: '...', contractHash: '...' })");
      console.log("wizup.s2contract.isReady('...')");
      console.log("wizup.s2contract.list()");
    }
  };
}
