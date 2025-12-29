/**
 * ✅ BACKEND INTEGRATION SAFETY CHECKLIST (PR Gate)
 * ================================================
 */

export const backendIntegrationChecklist = [
  "No UI files (components, styles, ui, pages) touched",
  "No route files touched",
  "No user-facing copy changes",
  "Protocol module hashes unchanged OR version bumped with signed rationale",
  "New Firestore writes are write-only shadow and gated behind flags",
  "New Firestore writes are idempotent via protocol-provided keys",
  "No new read-path dependencies in runtime product code",
  "No balance mutations in any logic path",
  "All season resolution entrypoints call requireProtocolIntegrityOrNoop()"
];
