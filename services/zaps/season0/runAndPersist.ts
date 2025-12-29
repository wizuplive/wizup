import type { Season0Config, SeasonId } from "./types";
import type { ZapsSignalSource } from "./sources/source";
import type { SeasonalArtifactSink } from "./persistence/artifactSink";
import { runSeason0Simulation } from "./season0Runner";

/**
 * 🚀 RUN AND PERSIST
 * ==================
 * Helper to execute a simulation and shadow-write the outcome artifact.
 */
export async function runSeason0AndPersist(args: {
  seasonId: SeasonId;
  communityId: string;
  window: { startMs: number; endMs: number };
  source: ZapsSignalSource;
  config: Season0Config;
  artifactSink: SeasonalArtifactSink;
}) {
  const res = await runSeason0Simulation({
    seasonId: args.seasonId,
    communityId: args.communityId,
    window: args.window,
    source: args.source,
    config: args.config,
  });

  // Shadow write the artifact (fail-open inside sink)
  await args.artifactSink.write(res.artifact);
  
  return res;
}
