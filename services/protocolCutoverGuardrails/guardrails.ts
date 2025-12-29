import { defaultCutoverViolationSink } from "./persistence/compositeViolationSink";
import { ProtocolCutoverViolationArtifactV1, ProtocolCutoverViolationCode } from "./types";
import { getCutoverGuardState } from "./cutoverState";

/**
 * 🛡️ PROTOCOL CUTOVER GUARDRAILS
 */

function mkId(code: string) {
  return `pcv1:${code}:${Date.now().toString(16)}:${Math.random().toString(16).slice(2, 6)}`;
}

/**
 * Authoritative guard for production.
 * If cutover receipt exists, using localStorage as primary is forbidden.
 */
export async function enforceNoLocalPrimaryAfterCutover(args: {
  operation: "READ" | "WRITE" | "MODE_SET";
  violationCode: ProtocolCutoverViolationCode;
  artifactKind?: string;
  seasonIdScope?: string;
  details?: Record<string, unknown>;
}) {
  const state = getCutoverGuardState();
  const sink = defaultCutoverViolationSink;

  // Invariant 1: Only enforces in production
  if (!state.isProduction) return { allowed: true };

  // Invariant 2: Only enforces if cutover is formally active
  if (!state.cutoverIsActive) return { allowed: true };

  // EXCEPTION: If we are here, and it's a "primary" path, it's a violation.
  const v: ProtocolCutoverViolationArtifactV1 = {
    version: "v1",
    id: mkId(args.violationCode),
    severity: "CRITICAL",
    code: args.violationCode,
    env: { 
      mode: "production", 
      buildTag: (window as any).WIZUP_BUILD_TAG 
    },
    cutover: {
      cutoverReceiptHash: state.cutoverReceiptHash,
      primaryReadMode: state.primaryReadMode ?? null,
    },
    context: {
      operation: args.operation,
      artifactKind: args.artifactKind,
      seasonIdScope: args.seasonIdScope,
      details: args.details,
    },
    createdAtMs: Date.now(),
  };

  await sink.emit(v);

  return { allowed: false, reason: "LOCAL_PRIMARY_FORBIDDEN_POST_CUTOVER", violationId: v.id };
}

/**
 * Legacy alias for internal backward compatibility
 */
export async function forbidLocalStoragePrimaryOrEmit(args: any) {
    const res = await enforceNoLocalPrimaryAfterCutover(args);
    return { blocked: !res.allowed, ...res };
}
