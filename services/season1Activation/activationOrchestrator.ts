import type { Season1ActivationReceipt, ActivationFailureCode } from "./types";
import { CompositeReceiptSink } from "./sinks/compositeReceiptSink";
import { LocalStorageReceiptSink } from "./sinks/localStorageReceiptSink";
import { FirestoreShadowReceiptSink } from "./sinks/firestoreShadowReceiptSink";
import { SealedContractStore } from "./seal/sealedContractStore";
import { sealActivationContract } from "./seal/contractSealer";

import { LocalStorageReadinessDecisionSource } from "./sources/readinessDecisionSource";
import { LocalStorageActivationContractSource } from "./sources/activationContractSource";
import { LocalStorageCompiledConstraintsSource } from "./sources/compiledConstraintsSource";

import { resolveSeasonWithConstraints } from "../seasonalResolution/constraintAware/resolve";
import { communityTreasuryResolver } from "../seasonalResolution/communityTreasuryResolver";
import { zapsSignalLogService } from "../zapsSignals/zapsSignalLogService";
import { sha256Hex, canonicalJson } from "./hash";

/**
 * 🚀 SEASON 1 ACTIVATION ORCHESTRATOR
 */

export async function activateSeason1Orchestrator(args: {
  seasonId: string;
  expectedReadinessDecisionHash: string;
  enableFirestoreShadow?: boolean;
}): Promise<Season1ActivationReceipt> {
  const seasonId = args.seasonId;
  const failures: NonNullable<Season1ActivationReceipt["failures"]> = [];

  const readinessSource = new LocalStorageReadinessDecisionSource();
  const contractSource = new LocalStorageActivationContractSource();
  const constraintsSource = new LocalStorageCompiledConstraintsSource();

  const receiptSink = new CompositeReceiptSink({
    local: new LocalStorageReceiptSink(),
    firestore: args.enableFirestoreShadow ? new FirestoreShadowReceiptSink() : undefined,
    enableFirestore: Boolean(args.enableFirestoreShadow),
  });

  // Idempotency: if already activated, return existing receipt
  const existing = await receiptSink.read(seasonId);
  if (existing?.decision === "ACTIVATED") return existing;

  // 1) Readiness gate
  const readiness = await readinessSource.read(seasonId);
  if (!readiness) {
    failures.push({ code: "READINESS_MISSING" });
    return await emitAbortReceipt({ seasonId, failures, receiptSink });
  }
  if (readiness.hashes.decisionHash !== args.expectedReadinessDecisionHash) {
    failures.push({ code: "READINESS_HASH_MISMATCH" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
    });
  }
  if (readiness.decision !== "PROCEED") {
    failures.push({ code: "READINESS_NOT_PROCEED" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
    });
  }

  // 2) Contract must exist and be unsealed
  const contract = await contractSource.readUnsealed(seasonId);
  if (!contract) {
    failures.push({ code: "CONTRACT_MISSING" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
    });
  }
  if (contract.sealed) {
    failures.push({ code: "CONTRACT_ALREADY_SEALED" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
    });
  }

  // 3) Compiled constraints must exist
  const compiledConstraints = await constraintsSource.read(seasonId);
  if (!compiledConstraints) {
    failures.push({ code: "CONSTRAINTS_MISSING" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
      unsealedContractHash: contract.activationHash,
    });
  }
  const constraintsHash = compiledConstraints.hashes?.constraintsHash;
  if (!constraintsHash) {
    failures.push({ code: "CONSTRAINTS_HASH_MISSING" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
      unsealedContractHash: contract.activationHash,
    });
  }

  // 4) Run constraint-aware resolution twice, prove determinism
  let run1: any;
  let run2: any;

  try {
    const window = { startAt: 0, endAt: Date.now() }; // In v1 resolution this window is standard
    const signals = zapsSignalLogService.listAll();
    const treasuries = await communityTreasuryResolver.resolveAll(seasonId, window);
    
    const resolutionInputs = {
      signals: signals as any,
      treasuries,
      timestamp: Date.now()
    };

    run1 = await resolveSeasonWithConstraints({ seasonId, constraints: compiledConstraints as any, inputs: resolutionInputs });
    run2 = await resolveSeasonWithConstraints({ seasonId, constraints: compiledConstraints as any, inputs: resolutionInputs });
  } catch {
    failures.push({ code: "RESOLUTION_FAILED" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
      unsealedContractHash: contract.activationHash,
      constraintsHash,
    });
  }

  const okDeterminism = run1.hashes.outputHash === run2.hashes.outputHash;
  if (!okDeterminism) {
    failures.push({ code: "NON_DETERMINISTIC_RESOLUTION" });
    return await emitAbortReceipt({
      seasonId,
      failures,
      receiptSink,
      readinessDecisionHash: readiness.hashes.decisionHash,
      readinessInputHash: readiness.hashes.inputHash,
      unsealedContractHash: contract.activationHash,
      constraintsHash,
      run1Hash: run1.hashes.outputHash,
      run2Hash: run2.hashes.outputHash,
    });
  }

  // 5) Seal contract
  const { sealedContractHash, sealPayloadForAudit } = await sealActivationContract({
    seasonId,
    unsealedContractHash: contract.activationHash,
    readinessDecisionHash: readiness.hashes.decisionHash,
    readinessInputHash: readiness.hashes.inputHash,
    constraintsHash,
    resolutionArtifactHash: run1.hashes.outputHash,
  });

  // 6) Persist sealed contract record
  const sealedStore = new SealedContractStore();
  const sealedRecord = {
    schemaVersion: "v1" as const,
    seasonId,
    unsealedContractHash: contract.activationHash,
    sealedContractHash,
    readinessDecisionHash: readiness.hashes.decisionHash,
    constraintsHash,
    resolutionArtifactHash: run1.hashes.outputHash,
    sealedAtMs: Date.now(),
    sealPayloadForAudit,
  };

  sealedStore.writeLocal(sealedRecord);
  if (args.enableFirestoreShadow) await sealedStore.writeFirestore(sealedRecord);

  // 7) Emit activation receipt
  const receipt: Season1ActivationReceipt = {
    schemaVersion: "v1",
    seasonId,
    decision: "ACTIVATED",
    readinessDecisionHash: readiness.hashes.decisionHash,
    readinessInputHash: readiness.hashes.inputHash,
    contract: {
      unsealedContractHash: contract.activationHash,
      sealedContractHash,
    },
    constraintsHash,
    resolutionArtifactHash: run1.hashes.outputHash,
    determinism: {
      run1Hash: run1.hashes.outputHash,
      run2Hash: run2.hashes.outputHash,
      ok: true,
    },
    generatedAtMs: Date.now(),
  };

  const okWrite = await receiptSink.writeOnce(seasonId, receipt);
  if (!okWrite) {
    const after = await receiptSink.read(seasonId);
    if (after) return after;

    failures.push({ code: "WRITE_FAILED" });
    return { ...receipt, decision: "ABORTED", failures };
  }

  return receipt;
}

async function emitAbortReceipt(args: {
  seasonId: string;
  failures: NonNullable<Season1ActivationReceipt["failures"]>;
  receiptSink: CompositeReceiptSink;
  readinessDecisionHash?: string;
  readinessInputHash?: string | null;
  unsealedContractHash?: string;
  sealedContractHash?: string;
  constraintsHash?: string;
  run1Hash?: string;
  run2Hash?: string;
}): Promise<Season1ActivationReceipt> {
  const receipt: Season1ActivationReceipt = {
    schemaVersion: "v1",
    seasonId: args.seasonId,
    decision: "ABORTED",
    readinessDecisionHash: args.readinessDecisionHash ?? "UNKNOWN",
    readinessInputHash: args.readinessInputHash ?? null,
    contract: {
      unsealedContractHash: args.unsealedContractHash ?? "UNKNOWN",
      sealedContractHash: args.sealedContractHash ?? "UNSEALED",
    },
    constraintsHash: args.constraintsHash ?? "UNKNOWN",
    resolutionArtifactHash: args.run1Hash ?? "UNKNOWN",
    determinism: {
      run1Hash: args.run1Hash ?? "UNKNOWN",
      run2Hash: args.run2Hash ?? "UNKNOWN",
      ok: false,
    },
    generatedAtMs: Date.now(),
    failures: args.failures,
  };

  await args.receiptSink.writeOnce(args.seasonId, receipt);
  return receipt;
}
