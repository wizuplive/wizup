
# SOVEREIGN AGENT MODE v0 — BOUNDARY ENFORCEMENT & AUTHORITY CONTAINMENT CONTRACT

**STATUS:** ACTIVE & ENFORCED
**SCOPE:** ALL ENVIRONMENTS (DEV/STAGE/PROD)
**PHASE:** v0 (SHADOW / SIMULATION)

## 1. AUTHORITY MATRIX

This matrix defines the **maximum permissible authority** for each mode. No code, configuration, or migration may exceed these bounds without a formal Phase Upgrade (v1).

| Mode | Capability | Live Mutation? | Human Confirm? | Allowed Actor Signature |
| :--- | :--- | :--- | :--- | :--- |
| **ASSIST** | Suggestion (Tag, Note, Hold) | **NO** | **YES** (Required) | `AI_MOD` |
| **AUTOPILOT** | Action (Hold Only) | **YES** (Visibility Only) | **NO** (Post-Audit) | `AI_MOD` |
| **SOVEREIGN v0** | **Simulation** (All Actions) | **NO** | N/A (Simulated) | `SOVEREIGN_AGENT` |
| **SOVEREIGN v0** | **Fallback** (Hold Only) | **YES** (Inherits Autopilot) | **NO** (Post-Audit) | `AI_MOD` (MUST NOT be Sovereign) |

**CRITICAL RULE:** In the production lane, Sovereign v0 is functionally identical to Autopilot. It **MUST NOT** sign actions as `SOVEREIGN_AGENT`. That signature is reserved exclusively for the Simulation Lane.

## 2. EXECUTION BOUNDARY GUARDS

To prevent accidental "Authority Creep," guards must exist at the edge of the Execution Service.

### Guard A: The Identity Firewall
**Location:** `services/autopilotExecutionService.ts`
**Logic:**
```typescript
// 🔒 BOUNDARY ENFORCEMENT
// Sovereign v0 is a Shadow Mode. If it touches production data (Real Feed), 
// it MUST degrade to the permissions and identity of Autopilot.
const actorSignature = "AI_MOD"; // HARDCODED. Do not allow "SOVEREIGN_AGENT".
```

### Guard B: The Mutation Lock
**Location:** `services/sovereignExecutionService.ts`
**Logic:**
This service MUST remain `read-only` regarding the Feed. It may write to `AuditLogs` or `SimulationStats`, but **NEVER** to `Posts` or `ModCases`.

### Guard C: Fail-Open Routing
If the system detects `mode: SOVEREIGN` but the `sovereignExecutionService` is offline or throwing errors, the system **MUST** default to `NO_ACTION` rather than attempting a raw execution bypass.

## 3. BACKEND MIGRATION SAFETY

As we migrate to Firestore/Cloud Functions (Phase 3), the following rules apply:

1.  **No Sovereign Writes:** Firestore Security Rules must block writes to the `posts` collection if `auth.token.role === 'SOVEREIGN_AGENT'`.
2.  **Legacy Compatibility:** Data migrations must map any historical `SOVEREIGN` mode flags in legacy data to `AUTOPILOT` behavior until v1 is live.
3.  **Flag Insufficiency:** A simple Feature Flag (`ENABLE_SOVEREIGN_V1 = true`) is **insufficient** to grant authority. Code deployment with new logic modules is required.

## 4. PROMOTION GATE (FUTURE: v0 -> v1)

Sovereign v0 can **ONLY** become Sovereign v1 (Live Autonomous Authority) via this specific sequence:

1.  **The Drift Audit:** 30 days of Simulation Lane data showing < 2% drift from Human decisions.
2.  **The Kill-Switch Verify:** Live test of the "Panic Pause" mechanism in a production staging environment.
3.  **The Legal Sign-off:** External review of the "Liability Contract" displayed in the Console.
4.  **The Code Promotion:** Deployment of a *new* execution service (`liveSovereignExecutionService.ts`). Do not "uncomment" code in v0 services.

## 5. NON-NEGOTIABLE INVARIANTS

1.  **The Shadow Wall:** The Simulation Lane and Production Lane are mathematically disjoint. Data never crosses from Sim to Prod.
2.  **Destruction Ban:** Sovereign v0 **NEVER** deletes data. It only changes visibility (HIDE/HOLD).
3.  **Human Supremacy:** A human `RESTORE` action is an immediate, localized Kill-Switch that resets local Agent Memory.
4.  **Identity Containment:** The string `SOVEREIGN_AGENT` shall not appear in the `actor` field of any record in the `modActions` live table.
5.  **Fail-Safe Default:** In any ambiguity, the system defaults to **ASSIST** (Human Required).

## 6. FINAL MANDATE

**Sovereign v0 exists to prove we can imagine autonomy safely — not to ship it.**

---
**Signed:** System Architect
**Date:** Phase 2.2C Freeze
**Status:** FROZEN
