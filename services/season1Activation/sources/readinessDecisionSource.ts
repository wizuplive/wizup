/**
 * 📖 READ-ONLY READINESS SOURCE
 */

export type ReadinessDecisionArtifactLite = {
  schemaVersion: "v1";
  seasonId: string;
  decision: "PROCEED" | "ABORT";
  reasons: string[];
  hashes: {
    inputHash: string;
    decisionHash: string;
    runnerVersion: string;
  };
};

export interface ReadinessDecisionSource {
  read(seasonId: string): Promise<ReadinessDecisionArtifactLite | null>;
}

export class LocalStorageReadinessDecisionSource implements ReadinessDecisionSource {
  constructor(private readonly storage: Storage = window.localStorage) {}

  private key(seasonId: string) {
    return `WIZUP::S1::READINESS_DECISION::v1::${seasonId}`;
  }

  async read(seasonId: string): Promise<ReadinessDecisionArtifactLite | null> {
    try {
      const raw = this.storage.getItem(this.key(seasonId));
      return raw ? (JSON.parse(raw) as ReadinessDecisionArtifactLite) : null;
    } catch {
      return null;
    }
  }
}
