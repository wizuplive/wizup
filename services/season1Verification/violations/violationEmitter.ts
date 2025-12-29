import { Season1ViolationArtifact, VerificationVerdict } from "../types/violationTypes";
import { sha256Hex, canonicalJson, stableId } from "../hash";
import { CompositeViolationSink, LocalStorageViolationSink, FirestoreShadowViolationSink } from "../persistence/violationSink";

const violationSink = new CompositeViolationSink([new LocalStorageViolationSink(), new FirestoreShadowViolationSink()]);

/**
 * 🕵️ VIOLATION EMITTER
 * ===================
 * Deterministic generation and emission of integrity failures.
 */
export async function emitSeason1Violation(
  seasonId: string, 
  communityId: string, 
  failureMode: Season1ViolationArtifact["failureMode"], 
  verdict: VerificationVerdict,
  partial?: Partial<Season1ViolationArtifact>
) {
  // 🛡️ NOOP BYPASS: Do not record violations for unactivated gate blocks
  if (partial?.stored?.bundleHash === "NOOP" || (partial as any)?.isNoop === true) {
    return;
  }

  const idInput = [seasonId, communityId, failureMode || "NONE", partial?.stored?.bundleHash || "unknown", String(Date.now())];
  
  const artifact: Season1ViolationArtifact = {
    id: await sha256Hex(stableId(idInput)),
    seasonId,
    communityId,
    verdict,
    failureMode,
    stored: partial?.stored || { bundleHash: "unknown" },
    recomputed: partial?.recomputed,
    notes: partial?.notes,
    hashes: {
      inputHash: await sha256Hex(canonicalJson({ seasonId, communityId })),
      outputHash: "",
      verifierVersion: "v1"
    },
    generatedAtMs: Date.now(),
    schemaVersion: "v1"
  };

  artifact.hashes.outputHash = await sha256Hex(canonicalJson({ ...artifact, generatedAtMs: undefined }));
  await violationSink.write(artifact);
}
