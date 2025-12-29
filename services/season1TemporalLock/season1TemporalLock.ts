import { isSeason1Activated } from "../season1Runtime/isSeason1Activated";
import { seasonWindowSource } from "./seasonWindowSource";
import { violationSink } from "./sinks/violationSink";
import { Season1ViolationArtifact, Season1ObjectType, Season1ViolationCode } from "./types/violation";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

let windowUnknownEmitted = false;

export const season1TemporalLock = {
  async enforceSeason1WritePolicy(args: {
    seasonId: string;
    communityId?: string;
    objectType: Season1ObjectType;
    proposedHash: string;
    existingHashLoader: () => Promise<string | null>;
    nowMs?: number;
  }): Promise<{ allowed: boolean; violationId?: string }> {
    const isS1 = args.seasonId === "S1" || args.seasonId === "SEASON_1" || args.seasonId === "active-season";
    if (!isS1) return { allowed: true };

    const activated = await isSeason1Activated("S1");
    if (!activated) return { allowed: true };

    const nowMs = args.nowMs || Date.now();
    const window = await seasonWindowSource.getWindow("S1");

    // 1. Temporal Check
    if (window) {
      if (nowMs < window.startMs || nowMs >= window.endMs) {
        const v = await this.emitViolation("OUT_OF_WINDOW_WRITE", "HIGH", args, {
          startMs: window.startMs,
          endMs: window.endMs,
          nowMs
        });
        return { allowed: false, violationId: v.id };
      }
    } else if (!windowUnknownEmitted) {
      // Log window unknown as low severity diagnostic once
      windowUnknownEmitted = true;
      await this.emitViolation("WINDOW_UNKNOWN", "LOW", args, { nowMs });
    }

    // 2. Immutability Check
    const existingHash = await args.existingHashLoader();
    if (existingHash && existingHash !== args.proposedHash) {
      const code: Season1ViolationCode = args.objectType === "activationReceipt" 
        ? "RECEIPT_CONFLICT" 
        : "POST_ACTIVATION_MUTATION_ATTEMPT";
        
      const v = await this.emitViolation(code, "CRITICAL", args, { nowMs, existingHash });
      return { allowed: false, violationId: v.id };
    }

    return { allowed: true };
  },

  async emitViolation(
    code: Season1ViolationCode, 
    severity: Season1ViolationArtifact["severity"],
    args: any,
    context: any
  ): Promise<Season1ViolationArtifact> {
    const occurredAtMs = Date.now();
    
    // Deterministic signature input
    const signatureInput = {
      seasonId: "S1",
      communityId: args.communityId,
      code,
      severity,
      objectType: args.objectType,
      proposedHash: args.proposedHash,
      existingHash: context.existingHash,
      startMs: context.startMs,
      endMs: context.endMs
    };

    const signature = await sha256Hex(canonicalJson(signatureInput));
    
    const artifact: Season1ViolationArtifact = {
      id: await sha256Hex(canonicalJson({ ...signatureInput, occurredAtMs })),
      seasonId: "S1",
      communityId: args.communityId,
      code,
      severity,
      occurredAtMs,
      actor: "SERVICE",
      attempted: {
        objectType: args.objectType,
        proposedHash: args.proposedHash,
        existingHash: context.existingHash,
        window: { startMs: context.startMs, endMs: context.endMs, nowMs: context.nowMs }
      },
      signatures: {
        signatureType: "HASH_STAMP_V1",
        signature
      },
      hashes: {
        artifactHash: "" // filled below
      },
      schemaVersion: "v1"
    };

    const { hashes, ...stable } = artifact;
    artifact.hashes.artifactHash = await sha256Hex(canonicalJson(stable));
    
    await violationSink.write(artifact);
    console.error(`[LOCK_ENFORCEMENT] ${code} detected. Artifact sealed: ${artifact.id}`);
    
    return artifact;
  }
};
