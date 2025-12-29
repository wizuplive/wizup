import { zapsSignalLogService } from "../../zapsSignals/zapsSignalLogService";

export interface SignalsSnapshot {
  seasonId: string;
  communityId: string;
  window: { startMs: number; endMs: number };
  events: Array<{
    id: string;
    communityId: string;
    userId: string;
    type: string;
    contentId?: string | null;
    timestamp: number;
    schemaVersion: string;
  }>;
}

export interface SignalsSnapshotSource {
  buildSignalsSnapshot(args: {
    seasonId: string;
    communityId: string;
    window: { startMs: number; endMs: number };
  }): Promise<SignalsSnapshot | null>;
}

export class LocalSignalSnapshotSource implements SignalsSnapshotSource {
  async buildSignalsSnapshot(args: {
    seasonId: string;
    communityId: string;
    window: { startMs: number; endMs: number };
  }): Promise<SignalsSnapshot | null> {
    const all = zapsSignalLogService.listAll();
    
    const filtered = all
      .filter(s => s.communityId === args.communityId && s.ts >= args.window.startMs && s.ts < args.window.endMs)
      .map(s => ({
        id: s.id,
        communityId: s.communityId,
        userId: s.actorUserId,
        type: s.type,
        contentId: s.targetId || null,
        timestamp: s.ts,
        schemaVersion: "v1"
      }))
      .sort((a, b) => {
        if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
        return a.id.localeCompare(b.id);
      });

    if (filtered.length === 0) return null;

    return {
      seasonId: args.seasonId,
      communityId: args.communityId,
      window: args.window,
      events: filtered
    };
  }
}