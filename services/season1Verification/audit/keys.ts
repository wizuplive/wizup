export const LS_AUDIT_KEYS = {
  summaryDoc: (seasonId: string) => `WIZUP::ZAPS::S1::AUDIT_SUMMARY::v1::${seasonId}`,
  summaryIndex: () => `WIZUP::ZAPS::S1::AUDIT_SUMMARY_INDEX::v1`,
};

export const FS_AUDIT_COLLECTIONS = {
  auditSummaries: "zaps_season1_audit_summaries",
};

export const FS_AUDIT_DOC_IDS = {
  summaryDoc: (seasonId: string) => `${seasonId}`,
};