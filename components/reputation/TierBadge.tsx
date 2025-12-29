import React from 'react';
import type { CommunityReputationLedger } from "../../types/reputation";

const tierToLabelShort: Record<CommunityReputationLedger["tier"], string> = {
  T0: "OBSERVER",
  T1: "PARTICIPANT",
  T2: "BUILDER",
  T3: "STEWARD",
  T4: "ANCHOR",
};

export function TierBadge({ tier }: { tier: CommunityReputationLedger["tier"] }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black tracking-widest text-purple-400 uppercase">
      {tierToLabelShort[tier]}
    </span>
  );
}