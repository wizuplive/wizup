import { NoopLatchV1 } from "../../season2Integrity/types";

export const latchSource = {
  async getNoopLatch(seasonId: string): Promise<NoopLatchV1 | null> {
    // S2 Latch
    const s2Key = `WIZUP::S2::NOOP_LATCH::v1::${seasonId}`;
    const s2Raw = localStorage.getItem(s2Key);
    if (s2Raw) return JSON.parse(s2Raw);

    // S1 Latch (Legacy Latch names if they exist)
    const s1Key = `WIZUP::S1::NOOP_LATCH::v1::${seasonId}`;
    const s1Raw = localStorage.getItem(s1Key);
    if (s1Raw) return JSON.parse(s1Raw);

    return null;
  }
};
