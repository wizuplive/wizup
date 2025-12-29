import React from 'react';
import { motion } from 'framer-motion';

const EnduranceSection: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden py-48 md:py-80 px-6 border-t border-white/[0.02]">
      
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
           className="w-[1200px] h-[1200px] border border-white/10 rounded-full relative"
         >
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white]" />
         </motion.div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-20 md:space-y-32">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ margin: "-20%" }}
          transition={{ duration: 2.5 }}
          className="text-[9px] font-black text-white uppercase tracking-[1em] block mb-12 md:mb-20"
        >
          History & Memory
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.9 }}
          viewport={{ margin: "-20%" }}
          transition={{ duration: 2, delay: 0.3 }}
          className="text-5xl md:text-[6rem] lg:text-[8rem] font-bold text-white tracking-tighter leading-[0.85] text-balance"
        >
          Trust is<br />
          <span className="text-white/10 font-light italic">lasting.</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.25 }}
          viewport={{ margin: "-10%" }}
          transition={{ duration: 2.5, delay: 1 }}
          className="text-xl md:text-2xl text-white font-light max-w-2xl mx-auto tracking-[0.05em] leading-relaxed"
        >
          Your identity isn’t a profile; it’s a story. Your trust and presence follow you everywhere you choose to belong.
        </motion.p>
      </div>
    </section>
  );
};

export default EnduranceSection;