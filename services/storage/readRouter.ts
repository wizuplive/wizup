import { ArtifactType } from "./types";
import { globalReadRouter } from "../protocolReadRouter";
import type { ProtocolArtifactKind } from "../protocolReadRouter/types";

/**
 * 🚥 LEGACY STORAGE READ ROUTER (DEPRECATED)
 * =========================================
 * Proxies to modular ProtocolReadRouter.
 */

export const protocolReadRouter = {
  async getArtifact<T>(args: {
    type: ArtifactType;
    seasonId: string;
    communityId?: string;
    lsKey: string;
    expectedHash?: string;
  }): Promise<{ data: T | null; source: string; integrityVerified: boolean }> {
    
    const { type, seasonId, communityId } = args;
    const kind = this.mapLegacyToNewKind(type);

    const result = await globalReadRouter.read<T>({
        kind,
        seasonId,
        communityId
    });

    return {
        data: result.value,
        // fix: Changed 'firestore' to 'FIRESTORE' to match the ReadSource type definition in services/protocolReadRouter/types.ts
        source: result.source === 'FIRESTORE' ? 'FIRESTORE_SHADOW' : 'LOCAL_STORAGE',
        integrityVerified: !!result.fingerprint
    };
  },

  // Removed invalid 'private' modifier from object literal method
  mapLegacyToNewKind(type: ArtifactType): ProtocolArtifactKind {
    switch (type) {
      case "ACTIVATION_RECEIPT": return "S1_ACTIVATION_RECEIPT";
      case "SEALED_CONTRACT": return "S1_SEALED_CONTRACT";
      case "COMPILED_CONSTRAINTS": return "S1_CONSTRAINTS";
      case "CANON_BUNDLE": return "S1_CANON_BUNDLE";
      case "SEASON_END_RECEIPT": return "S1_SEASON_END_RECEIPT";
      case "ARCHIVE_BUNDLE": return "S1_ARCHIVE_BUNDLE";
      case "SEASON_HEALTH": return "SEASON_HEALTH";
      default: return "UNKNOWN";
    }
  }
};