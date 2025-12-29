import { safeShadowSetDoc } from "../writer";
import { shadowDocId } from "../ids";

/**
 * 🏺 PROTOCOL SHADOW SINKS
 * ========================
 */

export const shadowSinks = {
  /**
   * F: CANON BUNDLES (COMMUNITY-LEVEL)
   */
  async writeCanonBundle(bundle: any) {
    const id = shadowDocId([
      "CANON_BUNDLE", 
      bundle.seasonId, 
      bundle.communityId, 
      bundle.bundleHash
    ]);
    await safeShadowSetDoc("zaps_season1_canon_bundles", id, "CANON_BUNDLE", bundle);
  },

  /**
   * C: ACTIVATION RECEIPTS
   */
  async writeActivationReceipt(receipt: any) {
    const id = shadowDocId([
      "ACTIVATION_RECEIPT", 
      receipt.seasonId, 
      receipt.sealHash || receipt.activationHash
    ]);
    await safeShadowSetDoc("activation_receipts_v1", id, "ACTIVATION_RECEIPT", receipt);
  },

  /**
   * B: SEASON 0 SIMULATION ARTIFACTS
   */
  async writeSeason0Artifact(artifact: any) {
    const id = shadowDocId([
      "S0_ART", 
      artifact.seasonId, 
      artifact.communityId, 
      artifact.hashes.outputHash
    ]);
    await safeShadowSetDoc("zaps_season0_simulation_artifacts_v1", id, "S0_ARTIFACT", artifact);
  },

  /**
   * G: VIOLATION ARTIFACTS
   */
  async writeViolation(violation: any) {
    const hash = violation.hashes?.artifactHash || violation.id;
    const id = shadowDocId(["VIOLATION", violation.seasonId, hash]);
    await safeShadowSetDoc("zaps_season_violation_artifacts_v1", id, "VIOLATION", violation);
  },

  /**
   * H: SEASON END + ARCHIVE
   */
  async writeSeasonEnd(receipt: any) {
    const id = shadowDocId(["SEASON_END", receipt.seasonId, receipt.receiptHash]);
    await safeShadowSetDoc("zaps_season_end_receipts_v1", id, "SEASON_END", receipt);
  },

  async writeArchiveBundle(archive: any) {
    const id = shadowDocId(["ARCHIVE", archive.seasonId, archive.archiveHash]);
    await safeShadowSetDoc("zaps_season_archive_bundles_v1", id, "ARCHIVE_BUNDLE", archive);
  },

  /**
   * I: SEASON 2 READINESS SEEDS
   */
  async writeReadinessSeed(seed: any) {
    // fix: Handle both naming conventions for readiness seeds (Season 2 sync vs Season End archival)
    const fromId = seed.fromSeasonId || seed.prevSeasonId;
    const sHash = seed.hashes?.seedHash || seed.seedHash;
    const id = shadowDocId(["READINESS_SEED", "from", fromId, sHash]);
    await safeShadowSetDoc("zaps_season2_readiness_seeds_v1", id, "READINESS_SEED", seed);
  },

  /**
   * D: SEALED CONTRACTS
   */
  async writeSealedContract(contract: any) {
    const hash = contract.hashes?.sealHash || contract.sealHash || contract.activationHash;
    const id = shadowDocId(["SEALED_CONTRACT", contract.seasonId, hash]);
    await safeShadowSetDoc("zaps_sealed_contracts_v1", id, "SEALED_CONTRACT", contract);
  }
};