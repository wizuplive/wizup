/**
 * 🔑 STORAGE NAMING CANON
 * =======================
 * Central authority for all Season 1 verifier keys and docIds.
 * Prevents divergence between verifier, sinks, and sources.
 */

export const LS_KEYS = {
  canonBundle: (seasonId: string, communityId: string) =>
    `WIZUP::ZAPS::S1::CANON_BUNDLE::${seasonId}::${communityId}`,

  canonIndex: () => `WIZUP::ZAPS::S1::CANON_BUNDLE_INDEX::v1`,

  activationReceipt: (seasonId: string) =>
    `WIZUP::S1::ACTIVATION_RECEIPT::v1::${seasonId}`,

  compiledConstraints: (seasonId: string) =>
    `WIZUP::GOV::CONSTRAINTS::v1::${seasonId}`,

  violationIndex: () => `wizup:season1:violations:index:v1`,
  violationDoc: (artifactId: string) => `wizup:season1:violations:v1:${artifactId}`,
};

export const FS_COLLECTIONS = {
  canonBundles: `zaps_season1_canon_bundles`,
  activationReceipts: `activation_receipts_v1`,
  violations: `zaps_season1_violation_artifacts`,
  constraints: `gov_constraints_v1`,
};

export const FS_DOC_IDS = {
  canonBundle: (seasonId: string, communityId: string) => `${seasonId}__${communityId}`,
  activationReceipt: (seasonId: string) => seasonId,
  constraints: (seasonId: string) => seasonId,
};
