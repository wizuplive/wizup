
import { 
  PolicySpec, 
  CompiledPolicy, 
  ThresholdConfig, 
  PolicyCategory, 
  PolicySeverity 
} from "../types/policyTypes";
import { ModPolicy } from "../types/modTypes";
import { driftLogService } from "./driftLogService";

// --- CONFIGURATION MATRICES ---

const SEVERITY_MATRIX: Record<PolicySeverity, ThresholdConfig> = {
  // Low friction, only catches egregious content
  RELAXED: { tag: 0.70, notify: 0.85, hold: 0.95 },
  // Balanced defaults (Equivalent to Phase 1 hardcoded values)
  STANDARD: { tag: 0.45, notify: 0.65, hold: 0.82 },
  // High friction, strictly protective
  STRICT: { tag: 0.25, notify: 0.50, hold: 0.75 }
};

const CATEGORIES: PolicyCategory[] = ['TOXICITY', 'SPAM', 'SCAM', 'LINK_RISK'];

// Safe Default Policy (Fail-Open)
const SAFE_DEFAULT: CompiledPolicy = {
  version: "v0.safe",
  communityId: "unknown",
  effectiveMode: "ASSIST",
  thresholds: {
    TOXICITY: SEVERITY_MATRIX.STANDARD,
    SPAM: SEVERITY_MATRIX.STANDARD,
    SCAM: SEVERITY_MATRIX.STANDARD,
    LINK_RISK: SEVERITY_MATRIX.STANDARD
  },
  matchers: { allowlist: [], blocklist: [] },
  routes: {
    TOXICITY: 'ASSIST_ONLY',
    SPAM: 'ASSIST_ONLY',
    SCAM: 'ASSIST_ONLY',
    LINK_RISK: 'ASSIST_ONLY'
  },
  policyHash: "safe_default_fallback",
  compiledAt: 0
};

export const policyCompilerService = {

  /**
   * Compiles a user-facing PolicySpec into an executable CompiledPolicy.
   * Deterministic: Same input spec -> Same output hash.
   */
  compile(spec: PolicySpec): CompiledPolicy {
    try {
      // 1. Normalize Inputs (Trim, Sort)
      const normalizedCategories = [...spec.categories].sort();
      const normalizedAllow = [...spec.allowlistPatterns].map(s => s.trim().toLowerCase()).sort();
      const normalizedBlock = [...spec.blocklistPatterns].map(s => s.trim().toLowerCase()).sort();

      // 2. Resolve Thresholds based on Severity Profile
      // In v0, we apply the profile globally. In v1, we could allow per-category overrides.
      const baseConfig = SEVERITY_MATRIX[spec.severity] || SEVERITY_MATRIX.STANDARD;
      
      const thresholds: Record<PolicyCategory, ThresholdConfig> = {} as any;
      const routes: Record<PolicyCategory, 'HOLD' | 'ASSIST_ONLY' | 'ESCALATE'> = {} as any;

      CATEGORIES.forEach(cat => {
        if (normalizedCategories.includes(cat)) {
          thresholds[cat] = baseConfig;
          // Phase 4.1: If mode is AUTOPILOT, we route to HOLD. Else ASSIST_ONLY.
          routes[cat] = spec.mode === 'AUTOPILOT' || spec.mode === 'SOVEREIGN' ? 'HOLD' : 'ASSIST_ONLY';
        } else {
          // Disabled category gets impossible thresholds
          thresholds[cat] = { tag: 1.1, notify: 1.1, hold: 1.1 };
          routes[cat] = 'ASSIST_ONLY';
        }
      });

      // 3. Compile Regex Matchers
      // Safety: Escape special chars to prevent ReDoS (simplified here)
      const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const allowMatchers = normalizedAllow
        .filter(s => s.length > 0)
        .map(s => new RegExp(escapeRegExp(s), 'i'));
        
      const blockMatchers = normalizedBlock
        .filter(s => s.length > 0)
        .map(s => new RegExp(escapeRegExp(s), 'i'));

      // 4. Construct Artifact
      const compiled: CompiledPolicy = {
        version: spec.version || "v0.1",
        communityId: spec.communityId,
        effectiveMode: spec.mode, // Execution gating happens in Execution Service
        thresholds,
        matchers: {
          allowlist: allowMatchers,
          blocklist: blockMatchers
        },
        routes,
        policyHash: "",
        compiledAt: Date.now()
      };

      // 5. Generate Hash (Deterministic ID)
      // We hash the JSON representation of the *logic* parts, excluding timestamp.
      const hashInput = {
        cid: compiled.communityId,
        mode: compiled.effectiveMode,
        thr: compiled.thresholds,
        rts: compiled.routes,
        allow: normalizedAllow,
        block: normalizedBlock
      };
      
      compiled.policyHash = driftLogService.hash(hashInput);

      return compiled;

    } catch (error) {
      console.error("[PolicyCompiler] Compilation Failed. Reverting to SAFE_DEFAULT.", error);
      return { ...SAFE_DEFAULT, communityId: spec.communityId, compiledAt: Date.now() };
    }
  },

  /**
   * Adapter: Converts the legacy ModPolicy DB object into a v0 PolicySpec.
   * This bridges the gap between the existing database and the new compiler.
   */
  adaptLegacyPolicy(legacy: ModPolicy): PolicySpec {
    // PHASE 4: CHECK FOR EXPLICIT INTENT FIELDS
    // If the new UI has been used, `severity` and `categories` will be present.
    if (legacy.severity && legacy.categories) {
        return {
            communityId: legacy.communityId,
            mode: legacy.mode,
            severity: legacy.severity,
            categories: legacy.categories,
            allowlistPatterns: [],
            blocklistPatterns: [],
            version: "v4.intent"
        };
    }

    // FALLBACK: Map legacy numerical strictness to named profile
    let severity: PolicySeverity = 'STANDARD';
    if (legacy.strictness < 0.3) severity = 'RELAXED';
    if (legacy.strictness > 0.7) severity = 'STRICT';

    return {
      communityId: legacy.communityId,
      mode: legacy.mode,
      severity,
      // Assume all categories enabled for legacy policies
      categories: ['TOXICITY', 'SPAM', 'SCAM', 'LINK_RISK'], 
      allowlistPatterns: [],
      blocklistPatterns: [],
      version: "v0.legacy-adapter"
    };
  }
};
