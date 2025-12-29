export const S2_READY_KEY = (id: string) => `WIZUP::S2::READY_CONTRACT::v1::${id}`;
export const S2_ACK_KEY = (id: string) => `WIZUP::S2::ARCHITECT_ACK::v1::${id}`;
export const S2_SEALED_KEY = (id: string) => `WIZUP::S2::SEALED_CONTRACT::v1::${id}`;
export const S2_RECEIPT_KEY = (id: string) => `WIZUP::S2::ACTIVATION_RECEIPT::v1::${id}`;

export const LS_VIOLATION_INDEX = "wizup:season2:violations:index:v1";

export const FS_S2_ACTIVATION_COLLECTIONS = {
  SEALED: "zaps_season2_sealed_contracts_v1",
  RECEIPTS: "zaps_season2_activation_receipts_v1",
  VIOLATIONS: "zaps_season2_violation_artifacts"
};
