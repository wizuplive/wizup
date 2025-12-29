
import React from "react";
import { IdentityMetrics } from "../../../services/activationService";

interface Props {
  metrics: IdentityMetrics;
}

export const SignalStabilityGauge: React.FC<Props> = ({ metrics }) => {
  const score = metrics.resonanceScore ?? 0;
  const trend = metrics.resonanceTrend ?? "stable";

  return (
    <section className="group relative rounded-[32px] bg-[#080808] border border-white/5 p-8 overflow-hidden shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-900/20 transition-colors duration-1000" />

      <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-8 relative z-10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" /> Signal Stability
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
        
        {/* QUANTUM DISC */}
        <div className="relative h-40 w-40 shrink-0 flex items-center justify-center">
          {/* Orbital Ring 1 (Slow) */}
          <div className="absolute inset-0 rounded-full border border-white/5 border-t-white/20 animate-[spin_10s_linear_infinite]" />
          
          {/* Orbital Ring 2 (Fast Reverse) */}
          <div className="absolute inset-4 rounded-full border border-white/5 border-b-white/20 animate-[spin_6s_linear_infinite_reverse]" />
          
          {/* Progress Arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
             <circle cx="50%" cy="50%" r="44%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
             <circle 
                cx="50%" cy="50%" r="44%" fill="none" 
                stroke="url(#gauge-gradient)" strokeWidth="4" 
                strokeDasharray="276" 
                strokeDashoffset={276 - (276 * score / 100)} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
             />
             <defs>
                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#c084fc" />
                   <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
             </defs>
          </svg>

          {/* Glass Core */}
          <div className="relative w-20 h-20 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center shadow-inner">
             <span className="text-3xl font-bold text-white tracking-tighter">{Math.round(score)}</span>
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">%</span>
          </div>
        </div>

        {/* Text Data */}
        <div className="flex flex-col gap-4 text-center md:text-left">
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xs">
            Your dimensional signal measures the clarity and consistency of your digital presence across the WIZUP network.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-3">
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-white">
                Trend: <span className={trend === 'rising' ? 'text-green-400' : 'text-gray-400'}>{trend}</span>
             </div>
             <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Quantum
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
