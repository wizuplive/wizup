import { Season2ReadinessSeed } from "./types";
import { s1ArtifactSource } from "./sources/localStorageSource";
import { sha256Hex, canonicalize } from "./hash";
import { defaultSeedSink } from "./persistence/compositeSeedSink";

/**
 * 🏗️ SEED BUILDER
 */
export async function buildSeason2ReadinessSeed(args: {
  fromSeasonId: string;
  toSeasonIdHint?: string;
}): Promise<Season2ReadinessSeed> {
  const { fromSeasonId, toSeasonIdHint } = args;

  // 1. Fetch Dependencies
  const receipt = await s1ArtifactSource.getReceipt(fromSeasonId);
  const archive = await s1ArtifactSource.getArchive(fromSeasonId);
  const constraints = await s1ArtifactSource.getConstraints(fromSeasonId);

  if (!receipt || receipt.status !== "FINALIZED") {
    throw new Error(`LINEAGE_FAILURE: Season ${fromSeasonId} end receipt is missing or not finalized.`);
  }

  if (!archive) {
    throw new Error(`LINEAGE_FAILURE: Archive bundle missing for season ${fromSeasonId}.`);
  }

  // 2. Compute Input Hash (Stable fields only)
  const inputPayload = {
    seasonEndReceiptHash: receipt.receiptHash,
    archiveBundleHash: archive.archiveHash,
    finalConstraintsHash: constraints?.hashes.compiledHash
  };
  const inputHash = await sha256Hex(canonicalize(inputPayload));

  // 3. Construct Payload
  const partialSeed: Omit<Season2ReadinessSeed, "hashes" | "createdAtMs"> = {
    schemaVersion: "s2-seed-v1",
    fromSeasonId,
    toSeasonIdHint,
    pointers: {
      seasonEndReceiptHash: receipt.receiptHash,
      archiveBundleHash: archive.archiveHash,
      finalConstraintsHash: constraints?.hashes.compiledHash
    }
  };

  // 4. Compute Seed Hash
  const seedHash = await sha256Hex(canonicalize(partialSeed));

  const seed: Season2ReadinessSeed = {
    ...partialSeed,
    hashes: {
      inputHash,
      seedHash,
      runnerVersion: "season2Seed@v1"
    },
    createdAtMs: Date.now()
  };

  // 5. Persist
  await defaultSeedSink.write(seed);

  return seed;
}

export async function getSeason2ReadinessSeed(fromSeasonId: string): Promise<Season2ReadinessSeed | null> {
  return defaultSeedSink.read(fromSeasonId);
}