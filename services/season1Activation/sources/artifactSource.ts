/**
 * 📖 READ-ONLY ARTIFACT SOURCES
 * =============================
 */

export interface ArtifactSource {
  read(key: string): Promise<any | null>;
  fingerprint?(key: string): Promise<string | null>;
}
