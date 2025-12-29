import { runTest, summarize, assert, equal, ok } from "./testRuntime";
import { FakeStorage } from "./fakes/fakeStorage";
import { FakeFirestore } from "./fakes/fakeFirestore";
import { clearWriteJournal, listWriteJournalEntries } from "../journal/writeJournal";
import { createProtocolWriteRouter } from "../createProtocolWriteRouter";
import { runShadowWriteParityMonitor } from "../monitor/shadowWriteParityMonitor";
import { ensureDualReadLatch, setDualReadLatch } from "../../protocolReadRouter/latch/dualReadLatch";
import { protocolWriteFlags } from "../protocolWriteFlags";

/**
 * 🧪 PROTOCOL WRITE ROUTER COVERAGE TEST
 * ======================================
 */

type KindCase = {
  kind: any;
  seasonId: string;
  communityId?: string;
  docId: string;
  payload: any;
};

function casesForSeason(seasonId = "S1_COVERAGE_TEST"): KindCase[] {
  return [
    {
      kind: "CANON_BUNDLE",
      seasonId,
      communityId: "test_shard",
      docId: `${seasonId}__test_shard`,
      payload: { bundleHash: "h_992", seasonId, communityId: "test_shard" },
    },
    {
      kind: "ACTIVATION_RECEIPT",
      seasonId,
      docId: seasonId,
      payload: { status: "ACTIVATED", receiptHash: "r_111", seasonId },
    },
    {
      kind: "SEALED_CONTRACT",
      seasonId,
      docId: seasonId,
      payload: { activationHash: "a_222", seasonId },
    },
    {
      kind: "ARCHIVE_BUNDLE",
      seasonId,
      docId: seasonId,
      payload: { archiveHash: "arch_333", seasonId },
    },
    {
      kind: "SEASON_END_RECEIPT",
      seasonId,
      docId: seasonId,
      payload: { receiptHash: "end_444", seasonId },
    },
    {
      kind: "READINESS_SEED",
      seasonId,
      docId: `from__${seasonId}`,
      payload: { seedHash: "seed_555", fromSeasonId: seasonId },
    },
  ];
}

async function writeAll(router: any, items: KindCase[]) {
  for (const c of items) {
    await router.write(
      { seasonId: c.seasonId, kind: c.kind, communityId: c.communityId, docId: c.docId },
      c.payload
    );
  }
}

export async function runProtocolWriteRouterCoverage() {
  const results = [];

  results.push(
    await runTest("setup test globals", async () => {
      // 1. Inject Fakes
      (globalThis as any).__WIZUP_TEST_STORAGE__ = new FakeStorage();
      (globalThis as any).__WIZUP_FIRESTORE__ = new FakeFirestore();

      // 2. Clear state
      clearWriteJournal();
      equal(listWriteJournalEntries().length, 0, "Journal should start empty in isolated storage");
    })
  );

  results.push(
    await runTest("writes create journal entries (latch OFF)", async () => {
      const seasonId = "S1_TEST_OPEN";
      clearWriteJournal();

      // Ensure flags allow shadow writes for test
      protocolWriteFlags.FIRESTORE_SHADOW_WRITES = true;
      setDualReadLatch(seasonId, { latched: false });

      const router = createProtocolWriteRouter();
      const items = casesForSeason(seasonId);

      await writeAll(router, items);

      const journal = listWriteJournalEntries().filter((e) => e.seasonId === seasonId);
      assert(journal.length >= items.length, "Journal should contain all attempted writes");
      assert(journal.some((e) => e.firestore?.mode === "WROTE"), "Expected Firestore to be in WROTE mode when latch is off");
    })
  );

  results.push(
    await runTest("shadow parity check (latch OFF)", async () => {
      const seasonId = "S1_TEST_PARITY";
      clearWriteJournal();
      setDualReadLatch(seasonId, { latched: false });

      const router = createProtocolWriteRouter();
      const items = casesForSeason(seasonId);

      await writeAll(router, items);

      const finding = await runShadowWriteParityMonitor({
        seasonId,
        maxEntries: 2000,
        blockThresholdMissing: 1,
      });

      equal(finding.verdict, "PASS", "Monitor should PASS when fake Firestore has all documents");
      equal(finding.stats.missingShadowWrites, 0, "No missing shadow writes should be reported");
    })
  );

  results.push(
    await runTest("latch ON forces Firestore NOOP", async () => {
      const seasonId = "S1_TEST_LATCHED";
      clearWriteJournal();
      setDualReadLatch(seasonId, { latched: true });

      const router = createProtocolWriteRouter();
      const items = casesForSeason(seasonId);

      await writeAll(router, items);

      const journal = listWriteJournalEntries().filter((e) => e.seasonId === seasonId);
      assert(journal.length > 0, "Journal entries should exist");
      
      const allLocalOk = journal.every(e => e.local.mode === "WROTE");
      const allFireNoop = journal.every(e => e.firestore.mode === "NOOP_DUE_TO_LATCH");

      assert(allLocalOk, "Local writes should still occur under latch");
      assert(allFireNoop, "All Firestore writes should have been forced to NOOP by latch");

      const finding = await runShadowWriteParityMonitor({ seasonId });
      equal(finding.verdict, "WARN", "Latched season monitor should return WARN instead of BLOCK/PASS");
    })
  );

  const summary = summarize(results);
  
  // Cleanup test injection
  delete (globalThis as any).__WIZUP_TEST_STORAGE__;
  delete (globalThis as any).__WIZUP_FIRESTORE__;

  console.group("%c[TEST] ProtocolWriteRouter Coverage", "color: #8b5cf6; font-weight: bold;");
  console.log(`PASS: ${summary.pass} / ${summary.total}`);
  if (summary.fail > 0) {
    console.error(`FAIL: ${summary.fail}`);
    summary.results.filter(r => r.status === 'FAIL').forEach(r => console.error(`- ${r.name}: ${r.error}`));
  }
  console.groupEnd();

  return summary;
}
