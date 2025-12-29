
import React from "react";
import { IdentityMetrics } from "../../../services/activationService";

interface Props {
  metrics: IdentityMetrics;
}

export const SignalTimelineGraph: React.FC<Props> = ({ metrics }) => {
  const timeline = metrics.signalTimeline ?? [];

  return (
    <section className="group rounded-[32px] bg-[#080808] border border-white/5 p-8 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      
      <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-8 relative z-10">
        Resonance ChronoFlow
      </h2>

      <div className="flex items-end justify-between gap-3 h-48 px-2 relative z-10">
        {timeline.map((t, i) => (
          <div key={i} className="flex flex-col items-center flex-1 group/bar cursor-default">
            <div className="relative w-full flex items-end justify-center h-full">
               {/* Background Track */}
               <div className="absolute bottom-0 w-1 h-full bg-white/5 rounded-full" />
               
               {/* Active Bar */}
               <div
                 className="relative w-1.5 rounded-full bg-gradient-to-t from-purple-900 to-cyan-400 transition-all duration-1000 ease-out group-hover/bar:w-2 group-hover/bar:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                 style={{ height: `${t.score}%`, minHeight: '10%' }}
               >
                  {/* Top Particle Glow */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 blur-md transition-opacity" />
               </div>
               
               {/* Tooltip */}
               <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-all transform translate-y-2 group-hover/bar:translate-y-0 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-20">
                  {t.score} Resonance
               </div>
            </div>
            <span className="text-[9px] font-bold text-gray-600 mt-3 group-hover/bar:text-white transition-colors uppercase tracking-wider">{t.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
