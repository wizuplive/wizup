/**
 * 🐕 READ PARITY WATCHDOG
 */

export type ReadParityReport = {
  seasonId: string;
  readsChecked: number;
  mismatches: number;
  missingRemote: number;
  verdict: "PASS" | "WARN" | "BLOCK";
};

export async function runReadParityWatchdog(args: {
  seasonId: string;
  samples: {
    key: string;
    local: any;
    remote: any;
  }[];
  blockThreshold: number;
}): Promise<ReadParityReport> {
  let mismatches = 0;
  let missingRemote = 0;

  for (const s of args.samples) {
    if (!s.remote) {
      missingRemote++;
    } else {
      const localStr = JSON.stringify(s.local);
      const remoteStr = JSON.stringify(s.remote);
      if (localStr !== remoteStr) {
        mismatches++;
      }
    }
  }

  const verdict =
    mismatches >= args.blockThreshold
      ? "BLOCK"
      : mismatches > 0
      ? "WARN"
      : "PASS";

  return {
    seasonId: args.seasonId,
    readsChecked: args.samples.length,
    mismatches,
    missingRemote,
    verdict,
  };
}
