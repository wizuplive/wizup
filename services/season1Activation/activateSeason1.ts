import { ActivationReceiptV1, ActivationFailureCode } from "./types";
import { defaultReceiptSink } from "./receiptSinks/compositeReceiptSink";
import { contractSealer } from "./contractSealer";
import { season1ArtifactService } from "./season1Artifact";
import { defaultReadinessSink } from "./persistence/localStorageReadinessSink";
import { defaultConstraintSink } from "../seasonalGovernance/constraintCompiler/sinks/localStorageSink";
import { resolveSeasonWithConstraints } from "../seasonalResolution/constraintAware/resolve";
import { communityTreasuryResolver } from "../seasonalResolution/communityTreasuryResolver";
import { zapsSignalLogService } from "../zapsSignals/zapsSignalLogService";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { freezeBaselineSource } from "../season1FreezeProof/freezeBaselineSource";
import { registrySource } from "../season1FreezeProof/sources/registrySource";

export async function activateSeason1(args: {
  seasonId: string;
  decisionHash: string;
}): Promise<{ ok: boolean; status: "ACTIVATED" | "REFUSED" | "ERROR"; receiptHash?: string; reasonCode?: string }> {
  const { seasonId, decisionHash } = args;

  try {
    const existing = await defaultReceiptSink.read(seasonId);
    if (existing?.status === "ACTIVATED") {
      return { ok: true, status: "ACTIVATED" };
    }

    const readiness = await defaultReadinessSink.read(seasonId);
    if (!readiness || readiness.verdict.decision !== "PROCEED" || readiness.hashes.outputHash !== decisionHash) {
      await recordFailure(seasonId, "READINESS_NOT_PROCEED", decisionHash);
      return { ok: false, status: "REFUSED", reasonCode: "READINESS_NOT_PROCEED" };
    }

    const contract = season1ArtifactService.read("CONTRACT");
    const constraints = await defaultConstraintSink.read(seasonId);
    if (!contract || !constraints) {
      const code = !contract ? "MISSING_CONTRACT" : "MISSING_CONSTRAINTS";
      await recordFailure(seasonId, code, decisionHash);
      return { ok: false, status: "REFUSED", reasonCode: code };
    }

    const window = { startAt: contract.timeWindow.startMs, endAt: contract.timeWindow.endMs };
    const signals = zapsSignalLogService.listAll().filter(s => s.ts >= window.startAt && s.ts <= window.endAt);
    const treasuries = await communityTreasuryResolver.resolveAll(seasonId, window);

    const resArgs = { seasonId, constraints: constraints as any, inputs: { signals: signals as any, treasuries, timestamp: Date.now() } };
    const run1 = await resolveSeasonWithConstraints(resArgs);
    const run2 = await resolveSeasonWithConstraints(resArgs);

    if (run1.hashes.outputHash !== run2.hashes.outputHash) {
      await recordFailure(seasonId, "NON_DETERMINISTIC_RESOLUTION", decisionHash);
      return { ok: false, status: "REFUSED", reasonCode: "NON_DETERMINISTIC_RESOLUTION" };
    }

    const { sealedContract, sealHash, sealedContractHash } = await contractSealer.seal({
      seasonId,
      contract: contract as any,
      decisionHash,
      constraintsHash: constraints.hashes.compiledHash,
      resolutionOutputHash: run1.hashes.outputHash
    });

    season1ArtifactService.save("SEALED_CONTRACT", sealedContract);
    if (db) {
      await setDoc(doc(db, "zaps_season1_sealed_contracts", seasonId), sealedContract, { merge: true });
    }

    const receipt: ActivationReceiptV1 = {
      schemaVersion: "v1",
      seasonId,
      status: "ACTIVATED",
      decisionHash,
      contractHash: contract.activationHash,
      constraintsHash: constraints.hashes.compiledHash,
      moralVerdictHash: readiness.required.season0LegitimacyVerdictHash || "unknown",
      batchAuditHash: "pending_summary",
      sealedContractHash,
      sealHash,
      resolutionOutputHash: run1.hashes.outputHash,
      determinism: { run1: run1.hashes.outputHash, run2: run2.hashes.outputHash, ok: true },
      writtenAtMs: Date.now()
    };

    const writeResult = await defaultReceiptSink.write(receipt);
    if (!writeResult.ok) {
      return { ok: false, status: "ERROR", reasonCode: "WRITE_FAILED" };
    }

    // --- ❄️ CAPTURE FREEZE BASELINE ---
    const immutableFingerprintHash = await registrySource.computeImmutableFingerprint({
      seasonId: "S1",
      contractHash: contract.activationHash,
      receiptHash: receipt.sealHash,
      constraintsHash: constraints.hashes.compiledHash
    });

    await freezeBaselineSource.captureAndPersist({
      seasonId: "S1",
      immutableFingerprintHash,
      activationReceiptHash: receipt.sealHash,
      capturedAtMs: Date.now(),
      baselineVersion: "v1"
    });

    return { ok: true, status: "ACTIVATED" };

  } catch (e) {
    console.error("[ORCHESTRATOR] Activation exception", e);
    return { ok: false, status: "ERROR", reasonCode: "UNKNOWN" };
  }
}

async function recordFailure(seasonId: string, code: ActivationFailureCode, decisionHash: string) {
  const receipt: ActivationReceiptV1 = {
    schemaVersion: "v1",
    seasonId,
    status: "REFUSED",
    reasonCode: code,
    decisionHash,
    contractHash: "none",
    constraintsHash: "none",
    moralVerdictHash: "none",
    batchAuditHash: "none",
    sealedContractHash: "none",
    sealHash: "none",
    resolutionOutputHash: "none",
    determinism: { run1: "none", run2: "none", ok: false },
    writtenAtMs: Date.now()
  };
  await defaultReceiptSink.write(receipt);
}
