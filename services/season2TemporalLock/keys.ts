export const S2_ACT_RECEIPT_KEY = (id: string) => `WIZUP::S2::ACTIVATION_RECEIPT::v1::${id}`;
export const S2_SEALED_CONTRACT_KEY = (id: string) => `WIZUP::S2::SEALED_CONTRACT::v1::${id}`;
export const S2_TEMPORAL_PROOF_KEY = (id: string) => `WIZUP::S2::TEMPORAL_LOCK_PROOF::v1::${id}`;
export const S2_FREEZE_PROOF_KEY = (id: string) => `WIZUP::S2::FREEZE_PROOF::v1::${id}`;
export const S2_NOOP_LATCH_KEY = (id: string) => `WIZUP::S2::NOOP_LATCH::v1::${id}`;

export const FS_S2_ENFORCEMENT_COLLECTIONS = {
  TEMPORAL_PROOFS: "zaps_season2_temporal_lock_proofs_v1",
  FREEZE_PROOFS: "zaps_season2_freeze_proofs_v1",
  NOOP_LATCHES: "zaps_season2_noop_latches_v1",
  VIOLATIONS: "zaps_season2_violation_artifacts"
};
