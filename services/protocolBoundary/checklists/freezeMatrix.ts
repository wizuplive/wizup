/**
 * ⚖️ PROTOCOL FREEZE MATRIX
 * =========================
 * Reference for allowed vs forbidden changes during backend integration.
 */

export const freezeMatrix = {
  forbidden: [
    "Changing signal type meaning or schema fields",
    "Adjusting weight saturation curves or diminishing returns",
    "Mutating canonical JSON sorting rules",
    "Adding amount/value fields to protocol signals",
    "Changing receipt or canon bundle schema structure",
    "Overriding NOOP sentinel conventions",
    "Altering violation code severity mapping"
  ],
  allowed: [
    "Switching storage provider (LS -> Firestore shadow)",
    "Switching auth provider (Identity stability mandatory)",
    "Adding transport retry logic (Idempotency required)",
    "Enhancing read-only dev observability",
    "Build tagging and infrastructure logging",
    "Caching layers with same-hash validation"
  ]
};
