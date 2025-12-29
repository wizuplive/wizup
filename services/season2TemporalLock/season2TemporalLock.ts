import { S2_ACT_RECEIPT_KEY, S2_SEALED_CONTRACT_KEY } from "./keys";
import { Season2TemporalLockProof } from "./types";
import { proofSinks } from "./persistence/proofSinks";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";
import { sha256Hex, canonicalize } from "./hash";

export async function assertSeason2WindowOrViolation(args: {
  seasonId: string;
  nowMs: number;
  action: string;
}): Promise<{ ok: true; sealHash: string; window: { startMs: number; endMs: number } } | { ok: false; reason: string }> {
  const { seasonId, nowMs, action } = args;

  try {
    const receiptRaw = localStorage.getItem(S2_ACT_RECEIPT_KEY(seasonId));
    const sealedRaw = localStorage.getItem(S2_SEALED_CONTRACT_KEY(seasonId));

    if (!receiptRaw || !sealedRaw) {
      await violationEmitter.emit(seasonId, "S2_NOT_ACTIVATED", { action });
      return { ok: false, reason: "S2_NOT_ACTIVATED" };
    }

    const sealed = JSON.parse(sealedRaw);
    const sealHash = sealed.hashes.sealHash;
    const window = sealed.window;

    // 1. Sanity Check
    if (window.startMs >= window.endMs) {
      await violationEmitter.emit(seasonId, "S2_WINDOW_INVALID", { window, action });
      return { ok: false, reason: "S2_WINDOW_INVALID" };
    }

    // 2. Window Enforcement
    if (nowMs < window.startMs || nowMs >= window.endMs) {
      await violationEmitter.emit(seasonId, "S2_OUTSIDE_WINDOW", { window, nowMs, action });
      return { ok: false, reason: "S2_OUTSIDE_WINDOW" };
    }

    // 3. Temporal Proof Generation (Write-Once)
    const partialProof: Omit<Season2TemporalLockProof, "proofHash" | "generatedAtMs"> = {
      schemaVersion: "v1",
      seasonId,
      sealHash,
      window,
      verdict: "ALLOW"
    };

    const proofHash = await sha256Hex(canonicalize(partialProof));
    const proof: Season2TemporalLockProof = {
      ...partialProof,
      proofHash,
      generatedAtMs: Date.now()
    };

    const existingProof = proofSinks.readTemporalProof(seasonId);
    if (existingProof && existingProof.proofHash !== proofHash) {
      await violationEmitter.emit(seasonId, "S2_POST_ACTIVATION_MUTATION", { 
        object: "TEMPORAL_PROOF", 
        existing: existingProof.proofHash, 
        proposed: proofHash 
      });
      return { ok: false, reason: "S2_POST_ACTIVATION_MUTATION" };
    }

    await proofSinks.writeTemporalProof(proof);

    return { ok: true, sealHash, window };

  } catch (e) {
    return { ok: false, reason: "UNKNOWN_ENFORCEMENT_ERROR" };
  }
}
