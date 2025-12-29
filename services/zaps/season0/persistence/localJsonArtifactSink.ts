import type { SeasonalArtifactSink } from "./artifactSink";
import type { SeasonalSimulationArtifact } from "../types";

/**
 * 💾 LOCAL JSON ARTIFACT SINK
 * ===========================
 * Appends simulation artifacts to a local JSONL file for audit/replay.
 */
export class LocalJsonArtifactSink implements SeasonalArtifactSink {
  constructor(
    private readonly deps: {
      // Injected to avoid browser compatibility issues
      fs: {
        mkdirSync: (path: string, opts?: any) => void;
        appendFileSync: (path: string, data: string) => void;
      };
      baseDir: string; // e.g. ".zaps_artifacts"
      fileName?: string; // default "season0_artifacts.jsonl"
    }
  ) {}

  async write(artifact: SeasonalSimulationArtifact): Promise<void> {
    try {
      const dir = this.deps.baseDir;
      const file = `${dir}/${this.deps.fileName ?? "season0_artifacts.jsonl"}`;

      this.deps.fs.mkdirSync(dir, { recursive: true });

      // JSONL append (one artifact per line)
      const line = JSON.stringify(artifact) + "\n";
      this.deps.fs.appendFileSync(file, line);
    } catch {
      // swallow (fail-open)
    }
  }
}
