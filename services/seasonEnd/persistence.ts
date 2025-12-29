import { SeasonEndReceipt, SeasonArchiveBundle, Season2ReadinessSeed } from "./types";
import { protocolWriteRouter } from "../protocolWriteRouter/singleton";
import { protocolReadRouter } from "../storage/readRouter";

/**
 * 🔑 ARCHIVAL PERSISTENCE KEYS
 */
const LS_KEYS = {
  RECEIPT: (id: string) => `WIZUP::S1::SEASON_END_RECEIPT::v1::${id}`,
  ARCHIVE: (id: string) => `WIZUP::S1::ARCHIVE_BUNDLE::v1::${id}`,
  SEED: (prevSeasonId: string) => `WIZUP::S2::READINESS_SEED::v1::from::${prevSeasonId}`,
};

export const archivalPersistence = {
  async writeReceipt(receipt: SeasonEndReceipt): Promise<void> {
    await protocolWriteRouter().write({
        seasonId: receipt.seasonId,
        kind: "SEASON_END_RECEIPT",
        docId: receipt.seasonId
    }, receipt);
  },

  async writeArchive(archive: SeasonArchiveBundle): Promise<void> {
    await protocolWriteRouter().write({
        seasonId: archive.seasonId,
        kind: "ARCHIVE_BUNDLE",
        docId: archive.seasonId
    }, archive);
  },

  async writeSeed(seed: Season2ReadinessSeed): Promise<void> {
    await protocolWriteRouter().write({
        // Fix: Season2ReadinessSeed in seasonEnd/types uses prevSeasonId
        seasonId: seed.prevSeasonId,
        kind: "READINESS_SEED",
        docId: seed.prevSeasonId
    }, seed);
  },

  async getReceipt(seasonId: string): Promise<SeasonEndReceipt | null> {
    const res = await protocolReadRouter.getArtifact<SeasonEndReceipt>({
        type: "SEASON_END_RECEIPT",
        seasonId,
        lsKey: LS_KEYS.RECEIPT(seasonId)
    });
    return res.data;
  },

  async getArchive(seasonId: string): Promise<SeasonArchiveBundle | null> {
    const res = await protocolReadRouter.getArtifact<SeasonArchiveBundle>({
        type: "ARCHIVE_BUNDLE",
        seasonId,
        lsKey: LS_KEYS.ARCHIVE(seasonId)
    });
    return res.data;
  }
};