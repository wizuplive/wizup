import { SeasonHealthArtifactV1 } from "./types";
import { violationsSource } from "./sources/violationsSource";
import { latchSource } from "./sources/latchSource";
import { freezeSource } from "./sources/freezeSource";
import { integritySource } from "./sources/integritySource";
import { activationSource } from "./sources/activationSource";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { DEV_SEASON_OBSERVABILITY } from "../../config/devFlags";
import { ENABLE_SEASON_OBSERVABILITY } from "../../config/featureFlagsSeasons";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

export const seasonHealthService = {
  async buildSeasonHealthArtifact(args: {
    seasonId: string;
    nowMs?: number;
  }): Promise<SeasonHealthArtifactV1> {
    if (!DEV_SEASON_OBSERVABILITY || !ENABLE_SEASON_OBSERVABILITY) {
       throw new Error("SEASON_OBSERVABILITY_DISABLED");
    }

    const seasonId = args.seasonId;
    const now = args.nowMs || Date.now();

    // 1. Gather Inputs
    const [violationSummary, latch, freeze, integrity, gates] = await Promise.all([
      violationsSource.getSummary(seasonId),
      latchSource.getNoopLatch(seasonId),
      freezeSource.getStatus(seasonId),
      integritySource.checkIntegrity(seasonId),
      activationSource.getStatus(seasonId)
    ]);

    // 2. Compute Status
    let status: SeasonHealthArtifactV1["status"] = "HEALTHY";
    if (latch?.hash) {
      status = "NOOP_LATCHED";
    } else if (
      (integrity.supported && integrity.ok === false) ||
      (freeze.supported && freeze.ok === false) ||
      violationSummary.totals.CRITICAL > 0
    ) {
      status = "CRITICAL";
    } else if (violationSummary.totals.WARN > 0) {
      status = "WARN";
    }

    // 3. Construct Payload
    const artifact: Omit<SeasonHealthArtifactV1, "hashes"> = {
      schemaVersion: "v1",
      seasonId,
      createdAtMs: now,
      buildTag: (window as any).WIZUP_BUILD_TAG,
      status,
      gates,
      noopLatch: {
        latched: !!latch,
        reason: latch?.reason,
        triggeredAtMs: latch?.triggeredAtMs,
        latchHash: latch?.hash
      },
      freezeProof: freeze,
      runtimeIntegrity: integrity,
      violations: {
        supported: true,
        totalsBySeverity: violationSummary.totals,
        lastViolation: violationSummary.lastViolation,
        indexSize: violationSummary.indexSize
      },
      notes: [`Snapshot generated at ${new Date(now).toISOString()}`]
    };

    // 4. Deterministic Hashing
    const inputHash = await sha256Hex(canonicalJson({
      seasonId,
      latch,
      freeze,
      integrity,
      gates,
      violationSummary
    }));

    // Exclude timestamps and buildTag from outputHash input
    const { createdAtMs, buildTag, ...stable } = artifact as any;
    const stableArtifact = {
       ...stable,
       freezeProof: { ...stable.freezeProof, lastCheckedAtMs: undefined },
       runtimeIntegrity: { ...stable.runtimeIntegrity, lastCheckedAtMs: undefined }
    };
    
    const outputHash = await sha256Hex(canonicalJson(stableArtifact));

    return {
      ...artifact,
      hashes: {
        inputHash,
        outputHash,
        engineVersion: "seasonObservability@v1"
      }
    } as SeasonHealthArtifactV1;
  }
};
