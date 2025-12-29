export const S2_CANDIDATE_KEY = (seasonId: string) =>
  `WIZUP::S2::CANDIDATE_CONTRACT::v1::${seasonId}`;

export const S2_READY_KEY = (seasonId: string) =>
  `WIZUP::S2::READY_CONTRACT::v1::${seasonId}`;

export const S2_ACK_KEY = (seasonId: string) =>
  `WIZUP::S2::ARCHITECT_ACK::v1::${seasonId}`;

export const S2_INDEX_KEY = () => `WIZUP::S2::CONTRACT_INDEX::v1`;

export const FS_S2_COLLECTIONS = {
  CANDIDATES: "zaps_season2_candidate_contracts_v1",
  READY: "zaps_season2_ready_contracts_v1",
  ACKS: "zaps_season2_architect_acks_v1",
  VIOLATIONS: "zaps_season2_violation_artifacts"
};
