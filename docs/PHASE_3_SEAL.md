
# PHASE 3 — BEHAVIORAL EQUIVALENCE MIGRATION: SEALED

“Phase 3 migrated persistence, not behavior.
Any change to decision-making semantics requires a new phase.”

## 1. Migration Status
- **Source Flip**: ACTIVE (Guarded by Feature Flag `READ_FROM_FIRESTORE`)
- **Primary Read**: Firestore (if enabled) -> LocalStorage (Fallback)
- **Write Strategy**: Dual-Write (Local + Shadow Cloud)
- **Drift Detection**: Passive Observation (Local Log)

## 2. Safety Contracts (Verified)
1. **Zero Latency Regression**: Async memory checks resolve immediately in local mode (microtask only).
2. **Fail-Open Cloud**: Firestore outages, timeouts, or errors fall back to local state transparently.
3. **Empty Cloud Handling**: Empty cloud results defer to local truth. This prevents data loss for communities that exist locally but haven't synced to the cloud yet.

## 3. The "No Branching" Rule
The `READ_FROM_FIRESTORE` flag affects **where** data comes from, never **how** it is processed.
The Autopilot execution logic (`autopilotExecutionService.ts`) is identical regardless of the data source.

---
**Status:** COMPLETE & SEALED
**Next Phase:** Phase 4 (Live Sovereign Authority - TBD)
