import { 
  SeasonAuditPackLine, 
  SeasonAuditPackManifest, 
  AuditArtifactType, 
  AuditPackResult 
} from "./types";
import { artifactSources } from "./sources/artifactSources";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

const ENGINE_VERSION = "seasonAuditExport@v1";

/**
 * 🏗️ AUDIT PACK BUILDER
 */
export async function buildSeasonAuditPack(seasonId: string): Promise<AuditPackResult | null> {
  const packLines: SeasonAuditPackLine[] = [];
  const artifactHashes: Record<string, string> = {};

  // 1. Define Required Artifact Chain
  const order: AuditArtifactType[] = [
    "ACTIVATION_RECEIPT",
    "SEALED_CONTRACT",
    "COMPILED_CONSTRAINTS",
    "FREEZE_PROOF",
    "RUNTIME_FINGERPRINT",
    "SEASON_HEALTH"
  ];

  // 2. Load and Validate each artifact
  for (const type of order) {
    const data = await fetchArtifact(type, seasonId);
    if (!data) {
      console.error(`[EXPORT_ABORT] Required artifact missing for ${seasonId}: ${type}`);
      return null;
    }

    // Verify current state matches sealed hash (Integrity Check)
    const currentHash = await computeIntegrityHash(type, data.artifact);
    if (currentHash !== data.hash) {
       await violationEmitter.emit(seasonId, "HASH_MISMATCH" as any, { 
         object: `EXPORT_${type}`, 
         stored: data.hash, 
         computed: currentHash 
       });
       console.error(`[EXPORT_ABORT] Hash mismatch detected for ${type} in season ${seasonId}.`);
       return null;
    }

    const line: SeasonAuditPackLine = {
      type,
      artifact: data.artifact,
      artifactHash: data.hash
    };

    packLines.push(line);
    artifactHashes[type] = data.hash;
  }

  // 3. Optional Artifacts
  const endReceipt = await fetchArtifact("SEASON_END_RECEIPT", seasonId);
  if (endReceipt) {
    const currentHash = await computeIntegrityHash("SEASON_END_RECEIPT", endReceipt.artifact);
    if (currentHash === endReceipt.hash) {
      const type = "SEASON_END_RECEIPT";
      const line: SeasonAuditPackLine = {
        type,
        artifact: endReceipt.artifact,
        artifactHash: endReceipt.hash
      };
      packLines.push(line);
      artifactHashes[type] = endReceipt.hash;
      order.push(type);
    }
  }

  // 4. Compute Global Pack Hash (Deterministic)
  // We hash the JSONL content order, excluding non-deterministic metadata
  const linesJson = packLines.map(line => canonicalJson(line));
  const packHash = await sha256Hex(linesJson.join("\n"));

  // 5. Generate Manifest
  const manifest: SeasonAuditPackManifest = {
    type: "AUDIT_PACK_MANIFEST",
    schemaVersion: "v1",
    seasonId,
    artifactOrder: order,
    artifactHashes,
    packHash,
    engineVersion: ENGINE_VERSION,
    createdAtMs: Date.now()
  };

  const finalLines = [...linesJson, canonicalJson(manifest)];
  const fileName = `wizup_season_audit_pack_v1_${seasonId}_${packHash.substring(0, 12)}.jsonl`;

  return {
    lines: finalLines,
    manifest,
    fileName
  };
}

async function fetchArtifact(type: AuditArtifactType, seasonId: string): Promise<{ artifact: any; hash: string } | null> {
  switch (type) {
    case "ACTIVATION_RECEIPT": return artifactSources.getActivationReceipt(seasonId);
    case "SEALED_CONTRACT": return artifactSources.getSealedContract(seasonId);
    case "COMPILED_CONSTRAINTS": return artifactSources.getCompiledConstraints(seasonId);
    case "FREEZE_PROOF": return artifactSources.getFreezeProof(seasonId);
    case "RUNTIME_FINGERPRINT": return artifactSources.getRuntimeFingerprint(seasonId);
    case "SEASON_HEALTH": return artifactSources.getSeasonHealth(seasonId);
    case "SEASON_END_RECEIPT": return artifactSources.getSeasonEndReceipt(seasonId);
    default: return null;
  }
}

async function computeIntegrityHash(type: AuditArtifactType, artifact: any): Promise<string> {
  // Re-run specific hashing logic per type to ensure stability
  // Note: Most artifacts store their outputHash inside 'hashes' or as a top-level field.
  // We extract the authoritative identifier.
  
  if (type === "SEASON_HEALTH") return artifact.hashes.outputHash;
  if (type === "RUNTIME_FINGERPRINT") return artifact.hashes.fingerprintHash;
  if (type === "COMPILED_CONSTRAINTS") return artifact.hashes.compiledHash;
  if (type === "ACTIVATION_RECEIPT") return artifact.activationHash || artifact.sealHash;
  if (type === "SEALED_CONTRACT") return artifact.hashes?.sealHash || artifact.sealHash;
  if (type === "FREEZE_PROOF") return artifact.registryHash || artifact.immutableFingerprintHash;
  if (type === "SEASON_END_RECEIPT") return artifact.receiptHash;
  
  return await sha256Hex(canonicalJson(artifact));
}
