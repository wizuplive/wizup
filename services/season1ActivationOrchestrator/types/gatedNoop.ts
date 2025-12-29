/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

export type GatedNoopMeta = {
  gated: true;
  reason: "NOT_ACTIVATED" | "NO_SEASON_ID" | "UNKNOWN";
  note: "Season 1 not activated; staying in Season 0 rehearsal.";
};

export function makeNoopMeta(reason: GatedNoopMeta["reason"]): GatedNoopMeta {
  return { gated: true, reason, note: "Season 1 not activated; staying in Season 0 rehearsal." };
}
