import type { ProtocolReadRouter } from "../protocolReadRouter";
import { protocolReadFlags } from "../../../config/protocolReadFlags";
import { readCanonBundleIndex } from "./parityIndexReader";
import { ParityGateStore } from "./parityGateStore";
import type { ParityGateVerdict } from "./parityGateTypes";

export type ParityCheckRow = {
  key: string;
  status: "MATCH" | "MISMATCH" | "MISSING";
  ls?: string;
  fs?: string;
};

export type ParityReport = {
  id: string;
  schemaVersion: "v1";
  seasonId: string;
  observedAtMs: number;

  totals: {
    totalChecks: number;
    matches: number;
    mismatches: number;
    missing: number;
    matchRate: number; // matches / totalChecks
    mismatchRate: number; // mismatches / totalChecks
  };

  mismatches: ParityCheckRow[];
  missing: ParityCheckRow[];
};

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function classify(lsFp?: string, fsFp?: string): "MATCH" | "MISMATCH" | "MISSING" {
  if (!lsFp && !fsFp) return "MISSING";
  if (!lsFp || !fsFp) return "MISSING";
  return lsFp === fsFp ? "MATCH" : "MISMATCH";
}

/**
 * RECOMMENDED: pass explicit sources so we can always read both sides.
 */
export async function runParitySummaryAggregator(args: {
  seasonId: string;
  readLocal: <T>(k: any) => Promise<{ fingerprint?: string }>;
  readFire: <T>(k: any) => Promise<{ fingerprint?: string }>;
  routerForIndex: ProtocolReadRouter; // only used to load index
}): Promise<{ report: ParityReport; gate: ParityGateVerdict }> {
  const now = Date.now();
  const seasonId = args.seasonId;

  const rows: ParityCheckRow[] = [];

  // 1) Global artifacts
  const globalKeys = [
    { kind: "S1_ACTIVATION_RECEIPT", seasonId },
    { kind: "S1_SEALED_CONTRACT", seasonId },
    { kind: "S1_CONSTRAINTS", seasonId },
    { kind: "S1_SEASON_END_RECEIPT", seasonId },
    { kind: "S1_ARCHIVE_BUNDLE", seasonId },
  ] as const;

  for (const k of globalKeys) {
    const [ls, fs] = await Promise.all([
      args.readLocal<any>(k).catch(() => ({ fingerprint: undefined })),
      args.readFire<any>(k).catch(() => ({ fingerprint: undefined })),
    ]);
    const status = classify(ls.fingerprint, fs.fingerprint);
    rows.push({
      key: `${k.kind}::${seasonId}`,
      status,
      ls: ls.fingerprint,
      fs: fs.fingerprint,
    });
  }

  // 2) Community canon bundles via index
  const index = await readCanonBundleIndex({ router: args.routerForIndex, seasonId });

  for (const communityId of index.communityIds) {
    const k = { kind: "S1_CANON_BUNDLE", seasonId, communityId };
    const [ls, fs] = await Promise.all([
      args.readLocal<any>(k).catch(() => ({ fingerprint: undefined })),
      args.readFire<any>(k).catch(() => ({ fingerprint: undefined })),
    ]);
    const status = classify(ls.fingerprint, fs.fingerprint);
    rows.push({
      key: `S1_CANON_BUNDLE::${seasonId}::${communityId}`,
      status,
      ls: ls.fingerprint,
      fs: fs.fingerprint,
    });
  }

  const totalChecks = rows.length;
  const matches = rows.filter((r) => r.status === "MATCH").length;
  const mismatches = rows.filter((r) => r.status === "MISMATCH").length;
  const missing = rows.filter((r) => r.status === "MISSING").length;

  const matchRate = totalChecks > 0 ? matches / totalChecks : 0;
  const mismatchRate = totalChecks > 0 ? mismatches / totalChecks : 0;

  const report: ParityReport = {
    id: makeId("parity_report"),
    schemaVersion: "v1",
    seasonId,
    observedAtMs: now,
    totals: {
      totalChecks,
      matches,
      mismatches,
      missing,
      matchRate,
      mismatchRate,
    },
    mismatches: rows.filter((r) => r.status === "MISMATCH"),
    missing: rows.filter((r) => r.status === "MISSING"),
  };

  // Gate verdict: BLOCK if mismatchRate exceeds threshold (and enough sample)
  const threshold = protocolReadFlags.PARITY_BLOCK_MISMATCH_RATE;
  const minSample = protocolReadFlags.PARITY_MIN_SAMPLE;

  const decision =
    totalChecks >= minSample && mismatchRate > threshold ? "BLOCK" : "ALLOW";

  const reason =
    totalChecks < minSample
      ? "INSUFFICIENT_SAMPLE"
      : mismatchRate > threshold
        ? "MISMATCH_RATE_EXCEEDED"
        : "OK";

  const gate: ParityGateVerdict = {
    id: makeId("parity_gate"),
    schemaVersion: "v1",
    seasonId,
    observedAtMs: now,
    decision,
    reason,
    mismatchRate,
    totalChecks,
    mismatchCount: mismatches,
    missingCount: missing,
    threshold,
  };

  // Persist verdict locally (dev-only).
  try {
    if (protocolReadFlags.DEV_PROTOCOL_READ_ROUTER && protocolReadFlags.PARITY_SUMMARY_AGGREGATOR) {
      new ParityGateStore().write(gate);
      window.localStorage.setItem(`wizup:protocol:parity:report:v1:${seasonId}`, JSON.stringify(report));
    }
  } catch {
    // fail-open
  }

  return { report, gate };
}
