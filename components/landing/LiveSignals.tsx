import React from 'react';

const STATEMENTS = [
  "IDENTITY THAT ENDURES",
  "CONNECTION THAT DEEPENS",
  "PARTICIPATION THAT COMPOUNDS",
  "STRUCTURE THAT HOLDS"
];

const LiveSignals: React.FC = () => {
  return (
    <section className="w-full bg-[#000] border-y border-white/[0.04] py-6 md:py-8 overflow-hidden relative z-20">
      {/* Cinematic Vignette Fade */}
      <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-scroll-left items-center select-none">
        {[...STATEMENTS, ...STATEMENTS, ...STATEMENTS, ...STATEMENTS].map((text, i) => (
          <div key={i} className="flex items-center gap-10 md:gap-16 px-5 md:px-8 opacity-60 hover:opacity-100 transition-opacity duration-1000 cursor-default group">
             <span className="text-[11px] md:text-[13px] font-medium text-white/90 tracking-[0.15em] transition-colors group-hover:text-white">
               {text}
             </span>
             <span className="text-purple-500/30 font-bold text-sm select-none" aria-hidden="true">•</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveSignals;
