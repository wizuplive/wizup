import { assert, equal, runTest, summarize } from "../../protocolWriteRouter/tests/testRuntime";
import { protocolRead } from "../protocolReadRouter";
import { runReadParityWatchdog } from "../monitor/readParityWatchdog";
import { setDualReadLatch } from "../latch/dualReadLatch";

/**
 * 🧪 READ PARITY COVERAGE TESTS
 */
export async function runReadParityCoverage() {
  const results = [];

  results.push(
    await runTest("Firestore-first read succeeds", async () => {
      const res = await protocolRead({
        seasonId: "S1_READ_TEST",
        readKey: "TEST_KEY_A",
        localRead: () => ({ v: 1 }),
        firestoreRead: async () => ({ v: 1 }),
      });
      equal(res.source, "FIRESTORE", "should read from Firestore when available");
    })
  );

  results.push(
    await runTest("Fallback to local when Firestore missing", async () => {
      const res = await protocolRead({
        seasonId: "S1_READ_TEST",
        readKey: "TEST_KEY_B",
        localRead: () => ({ v: 2 }),
        firestoreRead: async () => null,
      });
      equal(res.source, "LOCAL", "should fallback to local storage");
    })
  );

  results.push(
    await runTest("Latch blocks Firestore reads", async () => {
      setDualReadLatch("S1_READ_TEST_LATCHED", { latched: true });

      const res = await protocolRead({
        seasonId: "S1_READ_TEST_LATCHED",
        readKey: "TEST_KEY_C",
        localRead: () => ({ v: 3 }),
        firestoreRead: async () => ({ v: 999 }),
      });

      equal(res.source, "LOCAL", "should force local read when season is latched");
    })
  );

  results.push(
    await runTest("Parity watchdog BLOCKs on threshold", async () => {
      const report = await runReadParityWatchdog({
        seasonId: "S1_READ_TEST",
        blockThreshold: 1,
        samples: [
          { key: "SAMPLE_A", local: { x: 1 }, remote: { x: 2 } },
        ],
      });

      equal(report.verdict, "BLOCK", "should BLOCK when mismatches hit threshold");
    })
  );

  const summary = summarize(results);
  
  console.group("%c[TEST] ProtocolReadRouter Coverage", "color: #8b5cf6; font-weight: bold;");
  console.log(`PASS: ${summary.pass} / ${summary.total}`);
  if (summary.fail > 0) {
    summary.results.filter(r => r.status === 'FAIL').forEach(r => console.error(`- ${r.name}: ${r.error}`));
  }
  console.groupEnd();

  return summary;
}
