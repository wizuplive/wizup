/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 * Services-only / data-only / invisible to users / fail-open.
 */

import { ActivationReceipt, ActivationFailureCode } from "./types/activationReceipt";
import { readinessSource, contractSource, constraintsSource } from "./sources/artifactSources";
import { resolveSeasonWithConstraints } from "../seasonalResolution/constraintAware/resolve";
import { communityTreasuryResolver } from "../seasonalResolution/communityTreasuryResolver";
import { zapsSignalLogService } from "../zapsSignals/zapsSignalLogService";
import { contractSealer } from "./guards/contractSealer";
import { defaultReceiptSink } from "./persistence/compositeReceiptSink";
import { contractSealSink } from "./persistence/contractSealSink";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

export async function attemptSeason1Activation(args: {
  seasonId: string;
  mode: "DEV_MANUAL" | "CI" | "OFFLINE";
}): Promise<ActivationReceipt> {
  const runnerVersion = "season1ActivationOrchestrator@v1";
  const seasonId = args.seasonId;

  try {
    // 0. Check for existing successful activation (Idempotency)
    const existing = await defaultReceiptSink.read(seasonId);
    if (existing?.decision === "ACTIVATED") {
      return existing;
    }

    // 1. Readiness Check
    const readiness = await readinessSource.read(seasonId);
    if (!readiness) return createFailure(seasonId, "Readiness artifact missing.", ["READINESS_NOT_PROCEED"]);
    if (readiness.verdict.decision !== "PROCEED") return createFailure(seasonId, `Readiness state is ${readiness.verdict.decision}.`, ["READINESS_NOT_PROCEED"]);

    // 2. Contract Check
    const contract = await contractSource.read(seasonId);
    if (!contract) return createFailure(seasonId, "Activation contract missing.", ["CONTRACT_MISSING"]);
    if ((contract as any).sealed) return createFailure(seasonId, "Contract is already sealed.", ["CONTRACT_ALREADY_SEALED"]);

    // 3. Constraints Check
    const constraints = await constraintsSource.read(seasonId);
    if (!constraints) return createFailure(seasonId, "Compiled constraints missing.", ["CONSTRAINTS_MISSING"]);

    // 4. Run Simulation & Determinism Check
    const window = { startAt: contract.timeWindow.startMs, endAt: contract.timeWindow.endMs };
    const signals = zapsSignalLogService.listAll().filter(s => s.ts >= window.startAt && s.ts <= window.endAt);
    const treasuries = await communityTreasuryResolver.resolveAll(seasonId, window);

    const resolutionParams = {
      seasonId,
      constraints,
      inputs: { signals: signals as any, treasuries, timestamp: Date.now() }
    };

    const firstRun = await resolveSeasonWithConstraints(resolutionParams);
    const secondRun = await resolveSeasonWithConstraints(resolutionParams);

    if (firstRun.hashes.outputHash !== secondRun.hashes.outputHash) {
      return createFailure(seasonId, "Non-deterministic resolution artifact detected.", ["OUTPUT_NOT_DETERMINISTIC"]);
    }

    // 5. Sealing
    const { sealedContract, sealHash } = await contractSealer.seal(
      contract,
      readiness.hashes.outputHash,
      constraints.hashes.compiledHash,
      firstRun.hashes.outputHash,
      runnerVersion
    );

    // 6. Build Receipt
    const receipt: Omit<ActivationReceipt, "hashes"> = {
      schemaVersion: "v1",
      seasonId,
      activatedAtMs: Date.now(),
      decision: "ACTIVATED",
      contract: {
        contractHash: sealedContract.activationHash,
        sealHash,
        window: contract.timeWindow
      },
      moralGate: {
        readinessHash: readiness.hashes.outputHash,
        readinessDecision: readiness.verdict.decision as any
      },
      constraints: {
        compiledConstraintsHash: constraints.hashes.compiledHash,
        compilerVersion: "v1"
      },
      resolution: {
        resolutionArtifactHash: firstRun.hashes.outputHash,
        attestationHash: firstRun.hashes.outputHash, // Simplified v1
        engineVersion: firstRun.hashes.engineVersion
      }
    };

    // Deterministic Receipt Hashing
    const inputHashInput = {
      readinessHash: readiness.hashes.outputHash,
      contractBaseHash: contract.activationHash,
      constraintsHash: constraints.hashes.compiledHash,
      resInputs: { signals: signals.length, window }
    };
    const inputHash = await sha256Hex(canonicalJson(inputHashInput));
    const receiptHash = await sha256Hex(canonicalJson(receipt));

    const finalReceipt: ActivationReceipt = {
      ...receipt as ActivationReceipt,
      hashes: {
        inputHash,
        receiptHash,
        runnerVersion
      }
    };

    // 7. Atomic Write Attempt
    await contractSealSink.write(sealedContract);
    
    // Safety check: ensure write succeeded
    const verifyContract = await contractSealSink.read(seasonId);
    if (!verifyContract) {
      return createFailure(seasonId, "Failed to persist sealed contract artifact.", ["PERSISTENCE_FAILED"]);
    }

    await defaultReceiptSink.write(finalReceipt);

    return finalReceipt;

  } catch (e: any) {
    console.error("[ORCHESTRATOR] Unexpected error:", e);
    return createFailure(seasonId, "System encountered an unknown error.", ["UNKNOWN_ERROR"]);
  }
}

function createFailure(seasonId: string, reason: string, codes: ActivationFailureCode[]): ActivationReceipt {
  return {
    schemaVersion: "v1",
    seasonId,
    activatedAtMs: Date.now(),
    decision: "NOT_ACTIVATED",
    failure: { reason, codes },
    contract: { contractHash: "", sealHash: "", window: { startMs: 0, endMs: 0 } },
    moralGate: { readinessHash: "", readinessDecision: "DELAY" },
    constraints: { compiledConstraintsHash: "" },
    resolution: { resolutionArtifactHash: "", attestationHash: "" },
    hashes: { 
      inputHash: "", 
      receiptHash: "", 
      runnerVersion: "season1ActivationOrchestrator@v1" 
    }
  };
}
