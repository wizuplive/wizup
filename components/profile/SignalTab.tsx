
import React from "react";
import { IdentityMetrics } from "../../services/activationService";
import { SignalTimelineGraph } from "./signal/SignalTimelineGraph";
import { SignalStabilityGauge } from "./signal/SignalStabilityGauge";
import { ContributionHeatmap } from "./signal/ContributionHeatmap";
import { MicroNetworkMap } from "./signal/MicroNetworkMap";

interface Props {
  metrics: IdentityMetrics | null;
  loading: boolean;
}

export const SignalTab: React.FC<Props> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <div className="h-12 w-12 animate-pulse rounded-full bg-white/5" />
        <p className="mt-3 text-xs tracking-wide">Signal Analysis computing…</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-fade-in-up">
      {/* SECTION 1 — HIGH-LEVEL SIGNAL */}
      <SignalStabilityGauge metrics={metrics} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* SECTION 2 — RESONANCE OVER TIME */}
         <SignalTimelineGraph metrics={metrics} />

         {/* SECTION 3 — HEATMAP CONTRIBUTION */}
         <ContributionHeatmap metrics={metrics} />
      </div>

      {/* SECTION 4 — NETWORK MINI-MAP */}
      <MicroNetworkMap metrics={metrics} />
    </div>
  );
};
