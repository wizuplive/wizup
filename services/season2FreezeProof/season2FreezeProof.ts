import { S2_SEALED_CONTRACT_KEY } from "../season2TemporalLock/keys";
import { Season2FreezeProof } from "./types";
import { proofSinks } from "../season2TemporalLock/persistence/proofSinks";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";
import { sha256Hex, canonicalize } from "../season2TemporalLock/hash";

export async function computeOrVerifySeason2FreezeProof(args: {
  seasonId: string;
  nowMs: number;
}): Promise<{ ok: true; registryHash: string } | { ok: false; drift: true }> {
  const { seasonId } = args;

  try {
    const sealedRaw = localStorage.getItem(S2_SEALED_CONTRACT_KEY(seasonId));
    if (!sealedRaw) return { ok: false, drift: false } as any; // Not activated yet

    const sealed = JSON.parse(sealedRaw);
    
    // 1. Define Registry Inputs
    const registryInputs = {
      seasonId,
      sealHash: sealed.hashes.sealHash,
      window: sealed.window,
      parameters: sealed.parameters,
      lineage: sealed.lineage,
      engineVersion: "v1.1-locked",
      protocolSchema: "v1"
    };

    const registryHash = await sha256Hex(canonicalize(registryInputs));

    // 2. Verify against existing proof
    const existing = proofSinks.readFreezeProof(seasonId);
    if (existing) {
      if (existing.registryHash !== registryHash) {
        const vid = `v_drift_${Date.now()}`;
        await violationEmitter.emit(seasonId, "S2_FREEZE_DRIFT_DETECTED", { 
          id: vid, 
          stored: existing.registryHash, 
          computed: registryHash 
        });
        
        // 🚨 Global Latch Trigger
        await proofSinks.writeNoopLatch({
          latched: true,
          reasonCode: "S2_FREEZE_DRIFT_DETECTED",
          violationId: vid,
          latchedAtMs: Date.now()
        }, seasonId);

        return { ok: false, drift: true };
      }
      return { ok: true, registryHash };
    }

    // 3. Initialize Proof (Write-Once)
    const proof: Season2FreezeProof = {
      schemaVersion: "v1",
      seasonId,
      sealHash: sealed.hashes.sealHash,
      registryHash,
      generatedAtMs: Date.now(),
      verdict: "OK",
      inputs: {
        sealedContractHashRef: sealed.hashes.sealHash,
        engineVersion: "season2FreezeProof@v1"
      }
    };

    await proofSinks.writeFreezeProof(proof);
    return { ok: true, registryHash };

  } catch (e) {
    return { ok: false, drift: true }; // Fail-safe to drift
  }
}
