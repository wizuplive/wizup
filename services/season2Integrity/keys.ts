/**
 * 🔑 INTEGRITY STORAGE KEYS
 */

export const LS_KEYS = {
  FINGERPRINT: (seasonId: string) => `WIZUP::S2::RUNTIME_FINGERPRINT::v1::${seasonId}`,
  NOOP_LATCH: (seasonId: string) => `WIZUP::S2::NOOP_LATCH::v1::${seasonId}`,
  VIOLATION_INDEX: () => `wizup:season2:violations:index:v1`
};

export const FS_COLLECTIONS = {
  FINGERPRINTS: "zaps_season2_runtime_fingerprints_v1",
  NOOP_LATCHES: "zaps_season2_noop_latches_v1",
  VIOLATIONS: "zaps_season2_violation_artifacts"
};
