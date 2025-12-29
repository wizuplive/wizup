
import React from "react";
import { IdentityMetrics } from "../../../services/activationService";

interface Props {
  metrics: IdentityMetrics;
}

export const ContributionHeatmap: React.FC<Props> = ({ metrics }) => {
  const map = metrics.contributionMap ?? [];

  return (
    <section className="group rounded-[32px] bg-[#080808] border border-white/5 p-8 shadow-xl relative overflow-hidden">
      <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-8 relative z-10">
        Neural Matrix
      </h2>

      {/* 3D Grid Container */}
      <div 
        className="flex flex-col gap-1.5 transform transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ perspective: '1000px' }}
      >
        {map.map((row, r) => (
           <div key={r} className="grid grid-cols-7 gap-1.5" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(5deg)' }}>
              {row.map((value, c) => (
                <div
                  key={`${r}-${c}`}
                  className="aspect-square rounded-md transition-all duration-500 relative overflow-hidden group/cell"
                  style={{
                    backgroundColor: `rgba(139, 92, 246, ${0.1 + value * 0.8})`,
                    boxShadow: value > 0.7 ? `0 0 ${value * 10}px rgba(139, 92, 246, 0.4)` : 'none',
                    transform: `translateZ(${value * 10}px)`
                  }}
                  title={`Contribution: ${Math.round(value * 100)}`}
                >
                   {/* Sub-surface glow for high activity */}
                   {value > 0.6 && <div className="absolute inset-0 bg-white/20 blur-sm opacity-0 group-hover/cell:opacity-100 transition-opacity" />}
                </div>
              ))}
           </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between text-[9px] font-bold text-gray-600 uppercase tracking-wider">
         <span>Low Activity</span>
         <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-900/30" />
            <div className="w-2 h-2 rounded-full bg-purple-500/50" />
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" />
         </div>
         <span>Quantum</span>
      </div>
    </section>
  );
};
