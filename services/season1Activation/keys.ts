/**
 * 🔑 STORAGE NAMING CANON
 */

export const LS_KEYS = {
  activationReceipt: (seasonId: string) => `WIZUP::S1::ACTIVATION_RECEIPT::v1::${seasonId}`,
  sealedContract: (seasonId: string) => `WIZUP::S1::SEALED_CONTRACT::v1::${seasonId}`,
};

export const FS_COLLECTIONS = {
  activationReceipts: "activation_receipts_v1",
  sealedContracts: "zaps_season1_sealed_contracts",
};
