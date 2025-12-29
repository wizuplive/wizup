
import React from "react";
import { IdentityMetrics } from "../../../services/activationService";

interface Props {
  metrics: IdentityMetrics;
}

export const MicroNetworkMap: React.FC<Props> = ({ metrics }) => {
  const nodes = metrics.networkNodes ?? [];

  return (
    <section className="rounded-[32px] bg-[#080808] border border-white/5 p-8 shadow-xl overflow-hidden relative group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
      
      <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-8 relative z-10">
        Wavefield Display
      </h2>

      <div className="relative h-64 flex items-center justify-center">
        
        {/* Sonar Rings */}
        <div className="absolute border border-white/5 rounded-full w-32 h-32 animate-[ping_4s_linear_infinite] opacity-20" />
        <div className="absolute border border-white/5 rounded-full w-64 h-64 animate-[ping_4s_linear_infinite_reverse] opacity-10" />
        
        {/* Static Rings */}
        <div className="absolute border border-white/5 rounded-full w-32 h-32" />
        <div className="absolute border border-white/5 rounded-full w-64 h-64" />
        <div className="absolute border border-white/5 rounded-full w-96 h-96 opacity-50" />

        {/* Center Core */}
        <div className="absolute h-4 w-4 rounded-full bg-white shadow-[0_0_30px_white] z-30 animate-pulse" />

        {/* Floating Nodes */}
        {nodes.map((node, i) => {
          // Add some randomness to distribution for organic feel
          const radius = 60 + (node.strength * 70); 
          const angle = (i / nodes.length) * 2 * Math.PI + (i % 2 === 0 ? 0.2 : -0.2);

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={node.id}
              className="absolute rounded-full transition-all duration-[3000ms] hover:scale-150 cursor-pointer group/node"
              style={{
                height: `${4 + node.strength * 8}px`,
                width: `${4 + node.strength * 8}px`,
                background: i % 2 === 0 ? '#38bdf8' : '#c084fc',
                transform: `translate(${x}px, ${y}px)`,
                boxShadow: `0 0 ${10 * node.strength}px currentColor`,
                opacity: 0.6 + (node.strength * 0.4)
              }}
            >
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[8px] text-white opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                  Node {i+1}
               </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-6 relative z-10">
         <p className="text-xs text-gray-500 font-light">
            Monitoring <span className="text-white font-bold">{nodes.length}</span> active signal points.
         </p>
      </div>
    </section>
  );
};
