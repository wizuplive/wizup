import React from 'react';
import { motion } from 'framer-motion';

const PresenceExperience: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden py-48 md:py-80 px-6">
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-24 md:space-y-48">
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "-20%" }}
          transition={{ duration: 2.5 }}
          className="space-y-12 md:space-y-16"
        >
          <span className="text-[8px] font-black text-white/10 uppercase tracking-[1em] block mb-12 md:mb-20">The Experience</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white/90 tracking-tight leading-[1.1] max-w-4xl mx-auto text-balance">
            Nothing scrolls past you.<br />
            <span className="text-white/10">Showing up is an act of intention.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "-10%" }}
          transition={{ duration: 2, delay: 0.8 }}
          className="max-w-xl mx-auto space-y-16 md:space-y-24"
        >
          <p className="text-base md:text-lg text-white/20 font-light leading-relaxed tracking-[0.02em]">
            On WIZUP, we don't optimize for consumption; we optimize for continuity. Every contribution is recorded. Every relationship persists.
          </p>
          <div className="flex flex-col items-center gap-12">
            <div className="w-px h-24 md:h-32 bg-gradient-to-b from-white/10 to-transparent" />
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/5 italic">Human meaning preserved.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PresenceExperience;