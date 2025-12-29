/**
 * 🧪 MINIMAL TEST RUNTIME
 */

export function assert(condition: any, msg: string): void {
  if (!condition) throw new Error(`ASSERTION_FAILED: ${msg}`);
}

export function equal(a: any, b: any, msg: string): void {
  if (a !== b) throw new Error(`ASSERTION_FAILED: ${msg} (got=${String(a)} expected=${String(b)})`);
}

export function ok<T>(v: T, msg: string): T {
  assert(!!v, msg);
  return v;
}

export async function runTest(name: string, fn: () => Promise<void> | void) {
  const started = Date.now();
  try {
    await fn();
    return { name, status: "PASS" as const, ms: Date.now() - started };
  } catch (e: any) {
    return { name, status: "FAIL" as const, ms: Date.now() - started, error: String(e?.message ?? e) };
  }
}

export type TestResult = Awaited<ReturnType<typeof runTest>>;

export function summarize(results: TestResult[]) {
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.length - pass;
  return { pass, fail, total: results.length, results };
}
