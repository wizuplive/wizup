import type { ZapsSignalEvent } from "../../zapsSignals/zapsSignals.types";
// fix: Added SeasonalSimulationArtifact to imports
import type { Season0Config, Season0Result, SeasonId, SeasonalSimulationArtifact } from "./types";
import { canonicalJson, sha256Hex } from "./hash";
import { decayWeight, eventScore, saturate } from "./normalize";
import type { ZapsSignalSource } from "./sources/source";

export async function runSeason0Simulation(args: {
  seasonId: SeasonId;
  communityId: string;
  window: { startMs: number; endMs: number };
  source: ZapsSignalSource;
  config: Season0Config;
}): Promise<Season0Result> {
  const { seasonId, communityId, window, source, config } = args;

  const events = await source.listByCommunityAndWindow({
    communityId,
    startMs: window.startMs,
    endMs: window.endMs,
  });

  const inputForHash = {
    seasonId,
    communityId,
    window,
    events: events.map((e) => ({
      id: e.id,
      communityId: e.communityId,
      actorUserId: e.actorUserId,
      type: e.type,
      targetId: e.targetId ?? null,
      ts: e.ts,
    })),
  };

  const configForHash = {
    runnerVersion: config.runnerVersion,
    typeWeights: config.typeWeights,
    saturation: config.saturation,
    caps: config.caps,
    decay: config.decay,
    safety: config.safety,
  };

  const inputHash = await sha256Hex(canonicalJson(inputForHash));
  const configHash = await sha256Hex(canonicalJson(configForHash));

  const rawByUser = new Map<string, number>();
  const countsByUser = new Map<string, number>();
  const totalsByType: Record<string, number> = {};

  for (const e of events) {
    const weight = config.typeWeights[e.type];
    if (weight === undefined && config.safety.dropUnknownTypes) continue;

    const base = eventScore(e, config);
    const d = decayWeight(e.ts, window.endMs, config);
    const s = base * d;

    rawByUser.set(e.actorUserId, (rawByUser.get(e.actorUserId) ?? 0) + s);
    countsByUser.set(e.actorUserId, (countsByUser.get(e.actorUserId) ?? 0) + 1);
    totalsByType[e.type] = (totalsByType[e.type] ?? 0) + 1;
  }

  const eligibleUsers: string[] = [];
  for (const [userId, count] of countsByUser.entries()) {
    if (count >= config.caps.minEvents) eligibleUsers.push(userId);
  }

  const saturatedByUser = new Map<string, number>();
  let totalSat = 0;

  for (const userId of eligibleUsers) {
    const raw = rawByUser.get(userId) ?? 0;
    const sat = saturate(raw, config.saturation.k);
    saturatedByUser.set(userId, sat);
    totalSat += sat;
  }

  if (totalSat <= 0) {
    const artifactEmpty = await buildArtifact({
      seasonId,
      communityId,
      window,
      resolvedWeights: {},
      capsApplied: {},
      inputHash,
      configHash,
      runnerVersion: config.runnerVersion,
      notes: ["No eligible events in window."],
    });

    return {
      artifact: artifactEmpty,
      debug: { totalsByType, usersConsidered: 0, eventsConsidered: events.length },
    };
  }

  const weights: Record<string, number> = {};
  for (const [userId, sat] of saturatedByUser.entries()) {
    weights[userId] = sat / totalSat;
  }

  const capsApplied: Record<string, { raw: number; capped: number; capReason?: string }> = {};
  const maxShare = config.caps.maxShare;

  let clamped = { ...weights };
  clamped = clampMaxShare(clamped, maxShare, capsApplied);

  const artifact = await buildArtifact({
    seasonId,
    communityId,
    window,
    resolvedWeights: clamped,
    capsApplied,
    inputHash,
    configHash,
    runnerVersion: config.runnerVersion,
    notes: ["Season 0 simulation only. No balances mutated. No UI surfaces."],
  });

  return {
    artifact,
    debug: {
      totalsByType,
      usersConsidered: Object.keys(clamped).length,
      eventsConsidered: events.length,
    },
  };
}

function clampMaxShare(
  weights: Record<string, number>,
  maxShare: number,
  capsApplied: Record<string, { raw: number; capped: number; capReason?: string }>
): Record<string, number> {
  const users = Object.keys(weights).sort();
  let overflow = 0;
  for (const u of users) {
    const w = weights[u];
    if (w > maxShare) {
      overflow += w - maxShare;
      capsApplied[u] = { raw: w, capped: maxShare, capReason: "MAX_SHARE_CLAMP" };
      weights[u] = maxShare;
    } else {
      capsApplied[u] = { raw: w, capped: w };
    }
  }

  if (overflow <= 0) return renormalize(weights);

  const under = users.filter((u) => weights[u] < maxShare);
  if (under.length === 0) return weights;

  const underTotal = under.reduce((sum, u) => sum + weights[u], 0);
  if (underTotal <= 0) return weights;

  for (const u of under) {
    const add = overflow * (weights[u] / underTotal);
    weights[u] += add;
    if (weights[u] > maxShare) {
      const diff = weights[u] - maxShare;
      weights[u] = maxShare;
      capsApplied[u] = { raw: capsApplied[u].raw, capped: maxShare, capReason: "MAX_SHARE_CLAMP" };
    }
  }

  return renormalize(weights);
}

function renormalize(weights: Record<string, number>): Record<string, number> {
  const users = Object.keys(weights);
  const total = users.reduce((s, u) => s + weights[u], 0);
  if (total <= 0) return weights;
  for (const u of users) weights[u] = weights[u] / total;
  return weights;
}

// fix: Explicitly typed buildArtifact return as Promise<SeasonalSimulationArtifact> to fix widening of schemaVersion from "v1" to string.
async function buildArtifact(args: {
  seasonId: string;
  communityId: string;
  window: { startMs: number; endMs: number };
  resolvedWeights: Record<string, number>;
  capsApplied: Record<string, { raw: number; capped: number; capReason?: string }>;
  inputHash: string;
  configHash: string;
  runnerVersion: string;
  notes?: string[];
}): Promise<SeasonalSimulationArtifact> {
  const outputForHash = {
    seasonId: args.seasonId,
    communityId: args.communityId,
    window: args.window,
    resolvedWeights: args.resolvedWeights,
    capsApplied: args.capsApplied,
    schemaVersion: "v1" as const,
  };

  const outputHash = await sha256Hex(canonicalJson(outputForHash));

  return {
    seasonId: args.seasonId,
    communityId: args.communityId,
    window: args.window,
    schemaVersion: "v1",
    resolvedWeights: args.resolvedWeights,
    capsApplied: args.capsApplied,
    hashes: {
      inputHash: args.inputHash,
      configHash: args.configHash,
      outputHash,
      runnerVersion: args.runnerVersion,
    },
    notes: args.notes,
  };
}
