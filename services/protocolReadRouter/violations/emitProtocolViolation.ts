import type { ProtocolViolationArtifact, ProtocolViolationCode } from "./protocolViolationTypes";
import { canonicalJson, sha256Hex } from "./hash";
import { LocalStorageProtocolViolationSink } from "./protocolViolationSink";

/**
 * 📢 PROTOCOL VIOLATION EMITTER
 */

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

// Dedup in-memory to avoid spam per unique context
const dedupe = new Set<string>();

export async function emitCriticalProtocolViolation(args: {
  seasonId: string;
  code: ProtocolViolationCode;
  kind: string;
  communityId?: string;
  note?: string;
}): Promise<void> {
  try {
    const key = `${args.seasonId}::${args.code}::${args.kind}::${args.communityId ?? "-"}`;
    if (dedupe.has(key)) return;
    dedupe.add(key);

    const occurredAtMs = Date.now();

    const hashInput = {
      schemaVersion: "v1",
      seasonId: args.seasonId,
      severity: "CRITICAL",
      code: args.code,
      context: {
        kind: args.kind,
        communityId: args.communityId ?? null,
        note: args.note ?? null,
      },
    };

    const violationHash = await sha256Hex(canonicalJson(hashInput));

    const artifact: ProtocolViolationArtifact = {
      id: makeId("protocol_violation"),
      schemaVersion: "v1",
      seasonId: args.seasonId,
      occurredAtMs,
      severity: "CRITICAL",
      code: args.code,
      context: {
        kind: args.kind,
        communityId: args.communityId,
        note: args.note,
      },
      violationHash,
    };

    new LocalStorageProtocolViolationSink().write(artifact);
  } catch {
    // fail-open
  }
}
