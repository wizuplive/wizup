import { dataService } from "./dataService";
import type { ModPolicy } from "../types/modTypes";
import { policyCompilerService } from "./policyCompilerService";
import { CompiledPolicy } from "../types/policyTypes";
import { protocolReadRouter } from "./storage/readRouter";

const defaultPolicy = (communityId: string): ModPolicy => ({
  communityId,
  enabled: true,
  mode: "ASSIST",
  strictness: 0.5,
  thresholds: { tagAbove: 0.45, warnAbove: 0.65, hideAbove: 0.82 },
  permissions: { autoTag: true, autoWarn: false, autoHide: false },
  linkPolicy: "REVIEW",
  updatedAt: Date.now(),
});

export const modPolicyService = {
  async get(communityId: string): Promise<ModPolicy> {
    const key = `modPolicy:${communityId}`;
    
    // Attempt routed read (mapping to generic artifact type logic)
    const result = await protocolReadRouter.getArtifact<ModPolicy>({
        type: "COMPILED_CONSTRAINTS", // Close enough mapping for policy logic
        seasonId: "GLOBAL",
        communityId,
        lsKey: key
    });

    if (result.data) return result.data;
    
    const created = defaultPolicy(communityId);
    await dataService.set(key, created);
    return created;
  },
  
  async set(policy: ModPolicy) {
    policy.updatedAt = Date.now();
    await dataService.set(`modPolicy:${policy.communityId}`, policy);
  },

  async getCompiled(communityId: string): Promise<CompiledPolicy> {
    const rawPolicy = await this.get(communityId);
    const spec = policyCompilerService.adaptLegacyPolicy(rawPolicy);
    return policyCompilerService.compile(spec);
  }
};
