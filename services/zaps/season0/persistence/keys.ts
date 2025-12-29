/**
 * 🔑 PERSISTENCE KEYS
 * ===================
 * Deterministic keys for browser-scoped protocol storage.
 */

export function artifactIndexKey(): string {
  return "WIZUP::ZAPS::S0::ARTIFACT_INDEX::v1";
}

export function artifactDocKey(communityId: string, seasonId: string): string {
  return `WIZUP::ZAPS::S0::ARTIFACT::v1::${communityId}::${seasonId}`;
}
