import { Season2SealedContract, Season2ActivationReceipt } from "./types";
import { S2_READY_KEY, S2_ACK_KEY } from "./keys";
import { sha256Hex, canonicalize } from "./hash";
import { compositeSinks } from "./persistence/compositeSinks";
import { localStorageSinks } from "./persistence/localStorageSinks";
import { violationEmitter } from "./persistence/violationEmitter";
import { buildSeason2RuntimeFingerprint } from "../season2Integrity/runtimeFingerprintBuilder";
import { runtimeFingerprintSink } from "../season2Integrity/persistence/runtimeFingerprintSink";
import { latchSeason2Noop } from "../season2Integrity/noopLatch";

export async function sealSeason2Contract(args: {
  seasonId: string;
}): Promise<{ ok: boolean; sealHash?: string; activationHash?: string }> {
  const { seasonId } = args;

  try {
    // 1. Check for existing ACTIVATED receipt (Idempotency)
    const existingReceipt = localStorageSinks.readReceipt(seasonId);
    if (existingReceipt?.decision === "ACTIVATED") {
      return { ok: true, sealHash: existingReceipt.sealedContractSealHash, activationHash: existingReceipt.activationHash };
    }

    // 2. Load READY contract + ACK
    const readyRaw = localStorage.getItem(S2_READY_KEY(seasonId));
    const ackRaw = localStorage.getItem(S2_ACK_KEY(seasonId));

    if (!readyRaw) {
      await violationEmitter.emit(seasonId, "S2_READY_MISSING", { seasonId });
      return { ok: false };
    }
    if (!ackRaw) {
      await violationEmitter.emit(seasonId, "S2_ACK_MISSING", { seasonId });
      return { ok: false };
    }

    const ready = JSON.parse(readyRaw);
    const ack = JSON.parse(ackRaw);

    // 3. Validate cross-hashes
    if (ack.contractHash !== ready.hashes.contractHash) {
      await violationEmitter.emit(seasonId, "S2_HASH_MISMATCH", {
        readyHash: ready.hashes.contractHash,
        ackPointer: ack.contractHash
      });
      return { ok: false };
    }

    if (ready.status !== "READY") {
      await violationEmitter.emit(seasonId, "S2_HASH_MISMATCH", { status: ready.status, expected: "READY" });
      return { ok: false };
    }

    // 4. Validate Window
    if (ready.window.startMs >= ready.window.endMs || ready.window.endMs - ready.window.startMs < 3600000) {
      await violationEmitter.emit(seasonId, "S2_WINDOW_INVALID", ready.window);
      return { ok: false };
    }

    // 5. Construct Season2SealedContract
    const partialSealed: Omit<Season2SealedContract, "hashes"> = {
      schemaVersion: "v1",
      seasonId,
      sealedFrom: {
        readyContractHash: ready.hashes.contractHash,
        architectAckHash: ack.ackHash
      },
      window: ready.window,
      parameters: ready.parameters,
      lineage: ready.lineage,
      sealer: {
        sealerVersion: "season2ContractSealer@v1",
        sealedAtMs: Date.now()
      }
    };

    const sealHashInput = {
      ...partialSealed,
      sealer: { sealerVersion: partialSealed.sealer.sealerVersion }
    };
    const sealHash = await sha256Hex(canonicalize(sealHashInput));

    const sealedContract: Season2SealedContract = {
      ...partialSealed,
      hashes: { sealHash }
    };

    // 6. Construct Activation Receipt
    const partialReceipt: Omit<Season2ActivationReceipt, "activationHash" | "writtenAtMs"> = {
      schemaVersion: "v1",
      seasonId,
      decision: "ACTIVATED",
      readyContractHash: ready.hashes.contractHash,
      sealedContractSealHash: sealHash,
      architectAckHash: ack.ackHash,
      notes: ["Season 2 formal activation complete."]
    };

    const activationHash = await sha256Hex(canonicalize(partialReceipt));
    const receipt: Season2ActivationReceipt = {
      ...partialReceipt,
      activationHash,
      writtenAtMs: Date.now()
    };

    // 7. Persist (Sealed Contract then Receipt)
    const sealedOk = await compositeSinks.writeSealedContract(sealedContract);
    if (!sealedOk) return { ok: false };

    const receiptOk = await compositeSinks.writeReceipt(receipt);
    if (!receiptOk) return { ok: false };

    // --- 🛡️ RUNTIME INTEGRITY ATTESTATION ---
    // Capture the runtime state exactly at activation.
    const fingerprint = await buildSeason2RuntimeFingerprint({
      seasonId,
      sealedContractSealHash: sealHash
    });
    
    const fingerprintOk = await runtimeFingerprintSink.write(fingerprint);
    if (!fingerprintOk) {
       // Failing to write the law requires an immediate emergency latch
       await latchSeason2Noop({
         seasonId,
         reason: "CRITICAL_RUNTIME_DRIFT",
         sealedContractSealHash: sealHash
       });
       return { ok: false };
    }

    console.log(`%c[PROTOCOL] Season 2 ACTIVATED: ${seasonId}. Activation Hash: ${activationHash}`, "color: #06b6d4; font-weight: bold;");
    
    return { ok: true, sealHash, activationHash };

  } catch (e) {
    console.error("[SEALER_ERROR] Season 2 activation failed", e);
    return { ok: false };
  }
}
