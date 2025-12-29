import { ArtifactSource } from "./artifactSource";

/**
 * 💾 LOCAL STORAGE ARTIFACT SOURCE
 * ================================
 */
export class LocalStorageArtifactSource implements ArtifactSource {
  async read(key: string): Promise<any | null> {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async fingerprint(key: string): Promise<string | null> {
    const data = await this.read(key);
    if (!data) return null;
    // Look for standard hash fields in artifacts
    return data.hashes?.outputHash || data.hashes?.verdictHash || data.activationHash || data.hashes?.compiledHash || null;
  }
}

export const defaultArtifactSource = new LocalStorageArtifactSource();
