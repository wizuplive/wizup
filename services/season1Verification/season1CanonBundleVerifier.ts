import { featureFlags } from "../../config/featureFlags";
import { DEV_SEASON1_VERIFIER } from "../../config/devFlags";
import { VerificationVerdict } from "./types/violationTypes";
import { LocalStorageCanonBundleSource } from "./sources/localStorageCanonBundleSource";
import { FirestoreShadowCanonBundleSource } from "./sources/firestoreShadowCanonBundleSource";
import { LocalStorageReceiptSource } from "./sources/receiptSource";
import { LocalStorageConstraintsSource } from "./sources/constraintsSource";
import { LocalSignalSnapshotSource } from "./sources/signalsSnapshotSource";
import { DefaultResolutionReplay } from "./sources/resolutionReplay";
import { recomputeBundleHash } from "./recomputeBundleHash";
import { sha256Hex, canonicalJson } from "./hash";
import { emitSeason1Violation } from "./violations/violationEmitter";

const localBundleSource = new LocalStorageCanonBundleSource();
const firestoreBundleSource = new FirestoreShadowCanonBundleSource();
const receiptSource = new LocalStorageReceiptSource();
const constraintsSource = new LocalStorageConstraintsSource();
const signalSource = new LocalSignalSnapshotSource();
const replayResolver = new DefaultResolutionReplay();

export async function verifySeason1CanonBundle(args: {
  seasonId: string;
  communityId: string;
  window?: { startMs: number; endMs: number };
}): Promise<{ verdict: VerificationVerdict; storedBundleHash?: string; recomputedBundleHash?: string; }> {
  
  if (!DEV_SEASON1_VERIFIER || !featureFlags.ENABLE_SEASON1_VERIFIER) {
    return { verdict: "INCONCLUSIVE" };
  }

  try {
    // 1. Dual-Source Load
    const [localBundle, cloudBundle] = await Promise.all([
      localBundleSource.getCanonBundle(args),
      firestoreBundleSource.getCanonBundle(args)
    ]);

    // Comparison for divergence detection
    if (localBundle && cloudBundle && localBundle.bundleHash !== cloudBundle.bundleHash) {
      await emitSeason1Violation(args.seasonId, args.communityId, "HASH_MISMATCH", "FAIL", {
        stored: { bundleHash: localBundle.bundleHash },
        recomputed: { bundleHash: cloudBundle.bundleHash } as any,
        notes: ["STORAGE_DIVERGENCE: Local and cloud hashes disagree."]
      });
    }

    // Prefer local for speed, fallback to cloud
    const bundle = localBundle || cloudBundle;

    if (!bundle) {
      await emitSeason1Violation(args.seasonId, args.communityId, "MISSING_CANON_BUNDLE", "INCONCLUSIVE");
      return { verdict: "INCONCLUSIVE" };
    }

    // 2. Load Activation Receipt
    const receipt = await receiptSource.getReceipt(args.seasonId);
    if (!receipt || !receipt.sealed || receipt.decision !== "ACTIVATED") {
      await emitSeason1Violation(args.seasonId, args.communityId, "MISSING_RECEIPT", "INCONCLUSIVE", { stored: { bundleHash: bundle.bundleHash } });
      return { verdict: "INCONCLUSIVE" };
    }

    // 3. Load Constraints
    const constraints = await constraintsSource.getConstraints(args.seasonId);
    if (!constraints) {
      await emitSeason1Violation(args.seasonId, args.communityId, "MISSING_CONSTRAINTS", "INCONCLUSIVE", { stored: { bundleHash: bundle.bundleHash } });
      return { verdict: "INCONCLUSIVE" };
    }

    // 4. Validate Cross-Artifact Alignment
    if (bundle.constraintsHash !== receipt.constraintsHash || bundle.constraintsHash !== constraints.constraintsHash) {
      await emitSeason1Violation(args.seasonId, args.communityId, "HASH_MISMATCH", "FAIL", {
        stored: { bundleHash: bundle.bundleHash, constraintsHash: bundle.constraintsHash },
        notes: ["Constraints hash mismatch across artifacts."]
      });
      return { verdict: "FAIL", storedBundleHash: bundle.bundleHash };
    }

    if (bundle.receiptHash !== receipt.receiptHash) {
      await emitSeason1Violation(args.seasonId, args.communityId, "HASH_MISMATCH", "FAIL", {
        stored: { bundleHash: bundle.bundleHash, receiptHash: bundle.receiptHash },
        notes: ["Receipt hash mismatch."]
      });
      return { verdict: "FAIL", storedBundleHash: bundle.bundleHash };
    }

    // 5. Rebuild Signal Snapshot (Prefer stored window/snapshot if available)
    // Note: in v1, we check if the bundle contains a window hint
    const window = args.window || (bundle as any).window || { startMs: 0, endMs: Date.now() };
    const snapshot = await signalSource.buildSignalsSnapshot({ ...args, window });
    if (!snapshot) {
      await emitSeason1Violation(args.seasonId, args.communityId, "MISSING_SIGNALS", "INCONCLUSIVE", { stored: { bundleHash: bundle.bundleHash } });
      return { verdict: "INCONCLUSIVE" };
    }

    const snapshotHash = await sha256Hex(canonicalJson(snapshot));
    if (snapshotHash !== bundle.signalsSnapshotHash) {
      await emitSeason1Violation(args.seasonId, args.communityId, "HASH_MISMATCH", "FAIL", {
        stored: { bundleHash: bundle.bundleHash, signalsSnapshotHash: bundle.signalsSnapshotHash },
        recomputed: { signalsSnapshotHash: snapshotHash } as any
      });
      return { verdict: "FAIL", storedBundleHash: bundle.bundleHash };
    }

    // 6. Replay Resolution
    let replayResult;
    try {
      replayResult = await replayResolver.resolve({
        seasonId: args.seasonId,
        communityId: args.communityId,
        signalsSnapshot: snapshot,
        constraints: (constraints as any)
      });
    } catch (e: any) {
      if (e.message === "NON_DETERMINISTIC_REPLAY") {
        await emitSeason1Violation(args.seasonId, args.communityId, "NON_DETERMINISTIC_REPLAY", "FAIL", { stored: { bundleHash: bundle.bundleHash } });
        return { verdict: "FAIL", storedBundleHash: bundle.bundleHash };
      }
      throw e;
    }

    // 7. Recompute Bundle Hash
    const recomputedHash = await recomputeBundleHash({
      seasonId: args.seasonId,
      communityId: args.communityId,
      receiptHash: receipt.receiptHash,
      constraintsHash: constraints.constraintsHash,
      configHash: replayResult.configHash,
      signalsSnapshotHash: snapshotHash,
      resolutionArtifactHash: replayResult.resolutionArtifactHash
    });

    if (recomputedHash !== bundle.bundleHash) {
      await emitSeason1Violation(args.seasonId, args.communityId, "HASH_MISMATCH", "FAIL", {
        stored: { bundleHash: bundle.bundleHash },
        recomputed: {
          bundleHash: recomputedHash,
          receiptHash: receipt.receiptHash,
          constraintsHash: constraints.constraintsHash,
          configHash: replayResult.configHash,
          signalsSnapshotHash: snapshotHash,
          resolutionArtifactHash: replayResult.resolutionArtifactHash
        }
      });
      return { verdict: "FAIL", storedBundleHash: bundle.bundleHash, recomputedBundleHash: recomputedHash };
    }

    return { verdict: "PASS", storedBundleHash: bundle.bundleHash, recomputedBundleHash: recomputedHash };

  } catch (e: any) {
    await emitSeason1Violation(args.seasonId, args.communityId, "ERROR", "INCONCLUSIVE", { notes: [e.message] });
    return { verdict: "INCONCLUSIVE" };
  }
}
