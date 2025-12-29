import { CutoverProofArtifactV1 } from "./types";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { CUTOVER_PROOF_KEY } from "./keys";

/**
 * 🏺 CUTOVER PROOF ARTIFACT SERVICE
 */

export const proofArtifactService = {
  async generateProof(args: {
    dryRun: boolean;
    integrityResult: any;
    routerVersions: any;
  }): Promise<CutoverProofArtifactV1> {
    const payload = {
      protocolVersion: "v1.4-genesis",
      dryRun: args.dryRun,
      integrity: args.integrityResult,
      routerVersions: args.routerVersions,
      evaluatedAtMs: Date.now()
    };

    const proofHash = await sha256Hex(canonicalJson(payload));

    const artifact: CutoverProofArtifactV1 = {
      version: "v1",
      createdAtMs: Date.now(),
      receiptKey: "WIZUP::PROTOCOL::CUTOVER_RECEIPT::v1::primary",
      safeNoopLatchKey: "WIZUP::PROTOCOL::SAFE_NOOP_LATCH::v1::global",
      dryRuns: [
        {
          kind: args.dryRun ? "BOOT_INTEGRITY_DRYRUN_FIRESTORE_UP" : "BOOT_INTEGRITY_DRYRUN_FIRESTORE_DOWN", // Simple map for type compliance
          ok: args.integrityResult.status === "PASS",
          reason: args.integrityResult.reason,
          latchedAfter: false
        }
      ],
      proofHash
    };

    return artifact;
  },

  async persist(artifact: CutoverProofArtifactV1): Promise<void> {
    try {
      localStorage.setItem(CUTOVER_PROOF_KEY, JSON.stringify(artifact));
    } catch {
      // fail-open
    }
  }
};
