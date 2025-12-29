import type { Season0Config } from "./types";
import type { ZapsSignalEvent } from "../../zapsSignals/zapsSignals.types";

export function eventScore(e: ZapsSignalEvent, cfg: Season0Config): number {
  const w = cfg.typeWeights[e.type] ?? 0;
  return w;
}

export function decayWeight(timestampMs: number, windowEndMs: number, cfg: Season0Config): number {
  const age = Math.max(0, windowEndMs - timestampMs);
  const hl = cfg.decay.halfLifeMs;
  if (hl <= 0) return 1;
  return Math.pow(2, -age / hl);
}

export function saturate(raw: number, k: number): number {
  if (raw <= 0) return 0;
  return 1 - Math.exp(-k * raw);
}
