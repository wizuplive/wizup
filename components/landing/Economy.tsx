import React from 'react';
import { motion } from 'framer-motion';

const Economy: React.FC = () => {
  return (
    <section className="py-48 md:py-80 bg-black relative overflow-hidden flex flex-col items-center justify-center border-t border-white/[0.02]">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-900/[0.02] blur-[240px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-[8rem] font-bold text-white mb-24 tracking-tighter leading-none select-none">
          Reputation is state.
        </h2>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col md:flex-row justify-center gap-12 md:gap-24 text-[11px] text-white font-bold uppercase tracking-[0.5em] mb-48"
        >
           <span className="line-through decoration-white/20 decoration-1 opacity-20">Not for points.</span>
           <span className="line-through decoration-white/20 decoration-1 opacity-20">Not for perks.</span>
           <span className="text-white/80">For real impact.</span>
        </motion.div>
        
        {/* Abstract Visualization */}
        <div className="relative w-[500px] h-[500px] mx-auto flex items-center justify-center mb-48 group select-none">
           <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
             className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_80px_rgba(255,255,255,0.8)] z-20" 
           />
           {[1, 2, 3].map((i) => (
             <motion.div
               key={i}
               className="absolute inset-0 rounded-full border border-white/[0.02] group-hover:border-white/[0.06] transition-colors duration-[4s]"
               style={{ 
                 width: `${120 + i * 150}px`, 
                 height: `${120 + i * 150}px`,
                 left: '50%',
                 top: '50%',
                 x: '-50%',
                 y: '-50%',
               }}
               animate={{ 
                 rotateX: [0, 360], 
                 rotateY: [360, 0], 
                 scale: [1, 1 + i * 0.01, 1] 
               }}
               transition={{ duration: 60 + i * 30, repeat: Infinity, ease: "linear" }}
             />
           ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 0.2 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          <p className="text-2xl md:text-4xl text-white font-light leading-tight tracking-tighter text-balance">
             WIZUP remembers who showed up, who contributed, and who earned trust.
          </p>
          <p className="text-sm font-bold uppercase tracking-[0.4em]">
             This trace never decays. It only compounds.
          </p>
        </motion.div>

        <div className="mt-48 flex flex-wrap justify-center gap-24 text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">
           <div className="flex flex-col gap-4">
              <span className="text-white/40 italic">Presence</span>
              <span className="font-light">Observed</span>
           </div>
           <div className="flex flex-col gap-4">
              <span className="text-white/40 italic">Contribution</span>
              <span className="font-light">Weighted</span>
           </div>
           <div className="flex flex-col gap-4">
              <span className="text-white/40 italic">Stewardship</span>
              <span className="font-light">Entitled</span>
           </div>
        </div>
      </div>

    </section>
  );
};

export default Economy;