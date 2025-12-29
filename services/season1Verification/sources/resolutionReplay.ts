import { resolveSeasonWithConstraints } from "../../seasonalResolution/constraintAware/resolve";
import { sha256Hex, canonicalJson } from "../hash";

export interface ResolutionReplayResult {
  configHash: string;
  resolutionArtifactHash: string;
}

export interface ConstraintAwareResolver {
  resolve(args: {
    seasonId: string;
    communityId: string;
    signalsSnapshot: any; 
    constraints: any;
  }): Promise<ResolutionReplayResult>;
}

export class DefaultResolutionReplay implements ConstraintAwareResolver {
  async resolve(args: {
    seasonId: string;
    communityId: string;
    signalsSnapshot: any;
    constraints: any;
  }): Promise<ResolutionReplayResult> {
    
    // Preparation for standard resolver
    const inputs = {
      signals: args.signalsSnapshot.events.map((e: any) => ({
        ...e,
        ts: e.timestamp,
        actorUserId: e.userId,
        targetId: e.contentId
      })),
      treasuries: {}, // Community treasuries are not used in S1 share calculation
      timestamp: Date.now()
    };

    const resolveParams = {
      seasonId: args.seasonId,
      constraints: args.constraints,
      inputs: inputs as any
    };

    const firstRun = await resolveSeasonWithConstraints(resolveParams);
    const secondRun = await resolveSeasonWithConstraints(resolveParams);

    if (firstRun.hashes.outputHash !== secondRun.hashes.outputHash) {
      throw new Error("NON_DETERMINISTIC_REPLAY");
    }

    return {
      configHash: firstRun.hashes.constraintHash,
      resolutionArtifactHash: firstRun.hashes.outputHash
    };
  }
}