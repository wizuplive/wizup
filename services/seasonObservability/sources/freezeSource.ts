import { Season2FreezeProof } from "../../season2FreezeProof/types";
import { computeOrVerifySeason2FreezeProof } from "../../season2FreezeProof/season2FreezeProof";

export const freezeSource = {
  async getStatus(seasonId: string): Promise<{ supported: boolean; ok?: boolean; registryHash?: string; expectedRegistryHash?: string; driftCode?: string }> {
    const key = `WIZUP::S2::FREEZE_PROOF::v1::${seasonId}`;
    const raw = localStorage.getItem(key);
    
    if (!raw) return { supported: false };

    const stored = JSON.parse(raw) as Season2FreezeProof;
    const current = await computeOrVerifySeason2FreezeProof({ seasonId, nowMs: Date.now() });

    return {
      supported: true,
      ok: current.ok === true,
      registryHash: (current as any).registryHash || stored.registryHash,
      expectedRegistryHash: stored.registryHash,
      driftCode: current.ok === false ? "FREEZE_PROOF_DRIFT" : undefined
    };
  }
};
