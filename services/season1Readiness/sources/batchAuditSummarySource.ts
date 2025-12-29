export type BatchAuditSummaryLite = {
  seasonId: string;
  verdict: "PASS" | "PASS_WITH_WARNINGS" | "FAIL";
  hashes?: { summaryHash?: string };
  totals?: {
    communitiesIndexed: number;
    ok: number;
    fail: number;
    skipped: number;
  };
};

export interface BatchAuditSummarySource {
  read(seasonId: string): Promise<BatchAuditSummaryLite | null>;
}

export class LocalStorageBatchAuditSummarySource implements BatchAuditSummarySource {
  constructor(private readonly storage: Storage = window.localStorage) {}

  private key(seasonId: string) {
    return `WIZUP::ZAPS::S1::AUDIT_SUMMARY::v1::${seasonId}`;
  }

  async read(seasonId: string): Promise<BatchAuditSummaryLite | null> {
    try {
      const raw = this.storage.getItem(this.key(seasonId));
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        seasonId: data.seasonId,
        verdict: data.verdict,
        hashes: data.hashes,
        totals: data.totals
      };
    } catch {
      return null;
    }
  }
}