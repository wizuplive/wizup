import { ActivationReadinessArtifact, ReadinessVerdict, ReadinessFailureCode } from "./types";
import { defaultArtifactSource } from "./sources/localStorageSource";
import { checkPrerequisitesPresent } from "./checks/prerequisiteCheck";
import { checkHashIntegrity } from "./checks/integrityCheck";
import { checkEscapeHatches } from "./checks/escapeHatchCheck";
import { checkAbortSafety } from "./checks/abortSafetyCheck";
import { checkMoralGateAlignment } from "./checks/moralGateCheck";
import { resolveReadinessVerdict } from "./verdictResolver";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { defaultReadinessSink } from "./persistence/localStorageReadinessSink";

/**
 * 🔒 SEASON 1 READINESS PROOF ENGINE
 * ==================================
 */

export async function runSeason1ReadinessProof(args: {
  seasonId: string;
  mode: "DEV_MANUAL" | "CI" | "OFFLINE";
}): Promise<ActivationReadinessArtifact> {
  try {
    const source = defaultArtifactSource;
    
    // 1. Execute Checks
    const checks = [
      await checkPrerequisitesPresent(source),
      await checkHashIntegrity(source),
      await checkEscapeHatches(source),
      await checkAbortSafety(),
      await checkMoralGateAlignment(source)
    ].sort((a, b) => a.name.localeCompare(b.name));

    // 2. Resolve Prerequisites for Fingerprinting
    const gate = await source.read("WIZUP::GOV::GATE::v1::S1");
    const required = {
      season0LegitimacyVerdictHash: gate?.hashes?.conscienceHash,
      season1ActivationContractHash: (await source.read("WIZUP::S1::ARTIFACT::CONTRACT"))?.activationHash,
      season1ConstraintsCompiledHash: (await source.read("WIZUP::GOV::CONSTRAINTS::v1::S1"))?.hashes?.compiledHash
    };

    // 3. Compute Verdict
    const moralVerdict = gate?.verdict || "BLOCK";
    const verdict = resolveReadinessVerdict(checks, moralVerdict);

    // 4. Deterministic Hashing
    // Input hash covers required hashes and checks configuration (structure)
    const inputHash = await sha256Hex(canonicalJson({ seasonId: args.seasonId, required, checkNames: checks.map(c => c.name) }));
    
    // Output hash covers findings and final verdict
    const outputHashInput = {
      required,
      checks: checks.map(({ name, pass, severity, code }) => ({ name, pass, severity, code })),
      verdict: { decision: verdict.decision, blockingCodes: verdict.blockingCodes }
    };
    const outputHash = await sha256Hex(canonicalJson(outputHashInput));

    const artifact: ActivationReadinessArtifact = {
      schemaVersion: "v1",
      seasonId: args.seasonId,
      generatedAtMs: Date.now(),
      required,
      checks,
      verdict,
      hashes: {
        inputHash,
        outputHash,
        runnerVersion: "season1Readiness@v1"
      }
    };

    // 5. Persist
    await defaultReadinessSink.write(artifact);

    return artifact;

  } catch (e) {
    console.error("[READINESS_ENGINE] Critical Failure:", e);
    // FAIL-SAFE: DELAY on unknown errors
    return {
      schemaVersion: "v1",
      seasonId: args.seasonId,
      generatedAtMs: Date.now(),
      required: {},
      checks: [],
      verdict: { decision: "DELAY", reason: "Readiness engine encountered an internal error.", blockingCodes: ["UNKNOWN_ERROR"] },
      hashes: { inputHash: "err", outputHash: "err", runnerVersion: "season1Readiness@v1" }
    };
  }
}
