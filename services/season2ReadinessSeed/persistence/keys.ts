/**
 * 🔑 STORAGE NAMING CANON
 */

export const LS_KEYS = {
  // Lineage-explicit key format
  seed: (prevSeasonId: string) => `WIZUP::S2::READINESS_SEED::v1::from::${prevSeasonId}`,
  
  // Dependency keys (S1 context)
  s1Receipt: (id: string) => `WIZUP::S1::SEASON_END_RECEIPT::v1::${id}`,
  s1Archive: (id: string) => `WIZUP::S1::ARCHIVE_BUNDLE::v1::${id}`,
  s1Constraints: (id: string) => `WIZUP::GOV::CONSTRAINTS::v1::${id}`,
};

export const FS_COLLECTIONS = {
  seeds: "zaps_season2_readiness_seeds_v1",
};