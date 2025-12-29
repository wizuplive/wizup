import type { SeasonalArtifactSink } from "./artifactSink";
import { CompositeArtifactSink } from "./compositeArtifactSink";
import { MemoryArtifactSink } from "./memoryArtifactSink";
import { LocalStorageArtifactSink } from "./localStorageArtifactSink";

export type Season0ArtifactFlags = {
  WRITE_SEASON0_ARTIFACT_MEMORY: boolean;
  WRITE_SEASON0_ARTIFACT_LOCALSTORAGE: boolean;
};

/**
 * 🛠️ ARTIFACT SINK FACTORY
 * ========================
 * Configures the persistence layer based on environment/feature flags.
 */
export function createSeason0ArtifactSink(args: {
  flags: () => Season0ArtifactFlags;
}): { sink: SeasonalArtifactSink; memory?: MemoryArtifactSink } {
  const f = args.flags();

  const sinks: SeasonalArtifactSink[] = [];
  let memory: MemoryArtifactSink | undefined;

  if (f.WRITE_SEASON0_ARTIFACT_MEMORY) {
    memory = new MemoryArtifactSink();
    sinks.push(memory);
  }

  if (f.WRITE_SEASON0_ARTIFACT_LOCALSTORAGE) {
    sinks.push(
      new LocalStorageArtifactSink({
        maxIndexEntries: 50,
      })
    );
  }

  return { sink: new CompositeArtifactSink(sinks), memory };
}
