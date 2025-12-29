export const LS_READINESS_KEYS = {
  doc: (seasonId: string) => `WIZUP::S1::READINESS_DECISION::v1::${seasonId}`,
  index: () => `WIZUP::S1::READINESS_DECISION_INDEX::v1`,
};

export const FS_READINESS_COLLECTIONS = {
  decisions: "zaps_season1_readiness_decisions",
};

export const FS_READINESS_DOC_IDS = {
  doc: (seasonId: string) => `${seasonId}`,
};