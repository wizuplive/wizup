import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const CreateSection: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="create-marketing" className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden py-80 px-6 border-t border-white/[0.02]">
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          className="text-[9px] font-black text-white uppercase tracking-[1em] mb-32 select-none"
        >
          Build together
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-32"
        >
          <h3 className="text-3xl md:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.2] max-w-3xl mx-auto text-balance">
            You don’t spin something up.<br />
            <span className="text-white/20">You stand something up.</span>
          </h3>

          <div className="space-y-16">
            <p className="text-sm md:text-base text-white/30 font-light leading-relaxed tracking-widest max-w-lg mx-auto">
              Creating on WIZUP is an act of responsibility and lasting intent. Build once. Owned forever.
            </p>

            {/* Ritualistic CTA */}
            <div 
              className="relative py-20 flex flex-col items-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.button 
                animate={{ 
                  opacity: isHovered ? 1 : 0.2,
                  scale: isHovered ? 1 : 0.98
                }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col items-center gap-6"
              >
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors duration-700">
                  <ArrowRight size={20} className="text-white/40 group-hover:text-white transition-all group-hover:translate-x-1" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/40 group-hover:text-white transition-colors duration-700">
                  Start Building
                </span>
              </motion.button>

              <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 0.4, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -z-10 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreateSection;