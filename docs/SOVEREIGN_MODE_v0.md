
# SOVEREIGN AGENT MODE v0 — PHASE DEFINITION & SAFETY CONTRACT

**STATUS:** PROPOSED
**TIER:** ENTERPRISE
**SCOPE:** SIMULATION + DEMO-SAFE EXECUTION

## 1. DEFINITION

Sovereign Mode is the highest level of automated moderation. Unlike Autopilot (which is task-specific), Sovereign Mode implies a **delegation of judgment**.

In v0, this mode operates in **"Sovereign Shadow"**:
- The UI presents full autonomy (Contract, SLA, Liability).
- The Execution Layer is strictly bounded to **Safety Primitives**.

## 2. INVARIANTS (THE SAFETY CONTRACT)

1.  **NO IRREVERSIBLE HARM**: The Agent MAY NOT delete, ban, or destroy data. It may only HOLD or HIDE.
2.  **FAIL-OPEN**: If the Agent is unsure, latency is high, or memory is unavailable, it MUST do nothing.
3.  **HUMAN SUPREMACY**: A human override (Restore) acts as an immediate localized kill-switch for that context.
4.  **IMMUTABLE LEDGER**: Every Sovereign decision must be logged to a read-only audit trail before execution.

## 3. EXECUTION MODEL

| Capability | Autopilot | Sovereign v0 |
| :--- | :--- | :--- |
| **Trigger** | Rule Match | Alignment Score |
| **Action** | Hold | Hold (Shadow) |
| **Resolution** | Manual | Manual (Simulated Auto) |
| **Scope** | Content | Context |

## 4. KILL-SWITCH ARCHITECTURE

Sovereign Mode introduces a **Double-Key Kill-Switch**:
1.  **Local Panic**: Pause button on the Console. Instantly reverts to ASSIST mode.
2.  **Global Hard Stop**: Feature flag `DISABLE_SOVEREIGN_GLOBAL` in code.

## 5. STATE MODEL

- **LOCKED**: Insufficient history or lower tier plan.
- **ELIGIBLE**: History validation complete. Contract ready to sign.
- **ENABLED**: Agent is active and processing live traffic.
- **PAUSED**: Human intervention or Panic Pause triggered.

---
**Signed:** System Architect
