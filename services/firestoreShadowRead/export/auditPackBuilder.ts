import { AuditPack, SHADOW_COLLECTIONS } from "../types";
import { shadowReadClient } from "../client";
import { activationReceiptSource } from "../sources/activationReceiptSource";
import { canonBundleSource } from "../sources/canonBundleSource";
import { canonicalJson, sha256Hex } from "./hash";
import { where } from "firebase/firestore";

/**
 * 🏗️ SHADOW AUDIT PACK BUILDER
 * ============================
 */

export async function buildAuditPackFromFirestore(args: { 
  seasonId: string; 
  includeViolations?: boolean; 
  maxBundles?: number 
}): Promise<AuditPack | null> {
  const { seasonId } = args;
  const lines: any[] = [];
  const compHashes: Record<string, string> = {};

  // 1. Fetch Core Artifacts
  const receipt = await activationReceiptSource.getActivationReceipt(seasonId);
  if (receipt) {
    lines.push({ kind: "activation_receipt", ...sanitize(receipt) });
    compHashes.receiptsHash = receipt.activationHash || receipt.sealHash;
  }

  const contract = await shadowReadClient.getDocJson(SHADOW_COLLECTIONS.SEALED_CONTRACTS, seasonId);
  if (contract) lines.push({ kind: "sealed_contract", ...sanitize(contract) });

  const constraints = await shadowReadClient.getDocJson(SHADOW_COLLECTIONS.COMPILED_CONSTRAINTS, seasonId);
  if (constraints) lines.push({ kind: "compiled_constraints", ...sanitize(constraints) });

  // 2. Fetch Bundles (Ordered)
  const bundles = await canonBundleSource.listCanonBundlesForSeason(seasonId, args.maxBundles || 1000);
  const sortedBundles = [...bundles].sort((a, b) => 
    a.communityId.localeCompare(b.communityId) || a.bundleHash.localeCompare(b.bundleHash)
  );

  sortedBundles.forEach(b => lines.push({ kind: "canon_bundle", ...sanitize(b) }));
  compHashes.bundlesHash = await sha256Hex(canonicalJson(sortedBundles.map(b => b.bundleHash)));

  // 3. Fetch Health & Integrity (Optional)
  const health = await shadowReadClient.getDocJson(SHADOW_COLLECTIONS.SEASON_HEALTH, seasonId);
  if (health) {
    lines.push({ kind: "season_health", ...sanitize(health) });
    compHashes.healthHash = health.hashes?.outputHash;
  }

  // 4. Violations (Ordered & Capped)
  let violations: any[] = [];
  if (args.includeViolations) {
    violations = await shadowReadClient.queryDocs(
      SHADOW_COLLECTIONS.VIOLATIONS,
      [where("seasonId", "==", seasonId)],
      200
    );
    violations.sort((a, b) => (a.occurredAtMs - b.occurredAtMs) || a.id.localeCompare(b.id));
    violations.forEach(v => lines.push({ kind: "violation", ...sanitize(v) }));
    compHashes.violationsHash = await sha256Hex(canonicalJson(violations.map(v => v.id)));
  }

  // 5. Finalize Pack
  const jsonlLines = lines.map(l => canonicalJson(l));
  const linesDigest = await sha256Hex(jsonlLines.join("\n"));
  
  const packHash = await sha256Hex(canonicalJson({
    schema: "auditPack@v1",
    seasonId,
    componentHashes: compHashes,
    linesCanonicalDigest: linesDigest
  }));

  return {
    meta: {
      seasonId,
      generatedAtMs: Date.now(),
      source: "firestoreShadow",
      schema: "auditPack@v1",
      counts: {
        canonBundles: sortedBundles.length,
        violations: violations.length,
        healthArtifacts: health ? 1 : 0
      }
    },
    lines: jsonlLines,
    packHash,
    componentHashes: compHashes
  };
}

/**
 * Sanitize document by removing volatile shadow metadata
 */
function sanitize(doc: any): any {
  const { _shadowMeta, _writtenAtMs, ...rest } = doc;
  return rest;
}

export async function downloadAuditPackJsonl(args: { seasonId: string; includeViolations?: boolean }) {
  const pack = await buildAuditPackFromFirestore(args);
  if (!pack) return;

  const content = pack.lines.join("\n") + "\n" + canonicalJson({ kind: "manifest", ...pack.meta, packHash: pack.packHash });
  const blob = new Blob([content], { type: "application/x-jsonlines" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `wizup_audit_shadow_${args.seasonId}_${pack.packHash.substring(0, 12)}.jsonl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
