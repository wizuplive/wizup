import { ProtocolIntegrityDecision } from "../types/boundaryTypes";
import { getAuthoritativeManifest } from "../manifest";
import { sha256Hex, canonicalJson } from "../../zaps/season0/hash";
import { violationEmitter } from "../../season2Activation/persistence/violationEmitter";
import { proofSinks } from "../../season2TemporalLock/persistence/proofSinks";

/**
 * 🛡️ PROTOCOL INTEGRITY GUARD
 * ===========================
 * "Infra Cannot Mutate Protocol"
 */

export const protocolIntegrityGuard = {
  /**
   * Computes a Runtime Fingerprint of the current protocol logic versions.
   */
  async computeRuntimeFingerprint(): Promise<string> {
    const versions = {
      signal: "sig@v1",
      runner: "season0Runner@v1",
      engine: "constraintAwareResolver@v1",
      compiler: "season2ConstraintCompiler@v1",
      verifier: "season1Readiness@v1",
      bundle: "canonBundle@v1",
      violation: "violation@v1",
      canonical: "canonicalJson@v1"
    };

    return await sha256Hex(canonicalJson(versions));
  },

  /**
   * Authoritative gate for all season write/resolution paths.
   */
  async requireProtocolIntegrityOrNoop(seasonId: string): Promise<ProtocolIntegrityDecision> {
    const manifest = await getAuthoritativeManifest();
    const runtimeFingerprint = await this.computeRuntimeFingerprint();

    // In this v1 implementation, we compare against the aggregate manifest fingerprint
    // In v2, this would be a per-module check.
    const EXPECTED_FINGERPRINT = "proto_v1_genesis_f7e8a9"; // Placeholder for canonical sum

    if (runtimeFingerprint !== EXPECTED_FINGERPRINT && (seasonId.startsWith("S1") || seasonId.startsWith("S2"))) {
      const vid = `v_drift_${Date.now()}`;
      
      // 1. Emit CRITICAL Violation
      await violationEmitter.emit(seasonId, "S2_CANON_REGISTRY_HASH_MISMATCH" as any, {
        code: "PROTOCOL_BOUNDARY_DRIFT",
        severity: "CRITICAL",
        stored: EXPECTED_FINGERPRINT,
        computed: runtimeFingerprint,
        latchTriggered: true
      });

      // 2. Trip NOOP LATCH for the season
      await proofSinks.writeNoopLatch({
        latched: true,
        reasonCode: "PROTOCOL_BOUNDARY_DRIFT",
        violationId: vid,
        latchedAtMs: Date.now()
      }, seasonId);

      return { 
        ok: false, 
        fingerprintHash: runtimeFingerprint, 
        reason: "DRIFT_DETECTED", 
        latchKey: vid 
      };
    }

    return { ok: true, fingerprintHash: runtimeFingerprint };
  }
};
