import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC<{ onEnter: () => void; onReadManifesto?: () => void }> = ({ onEnter, onReadManifesto }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.7]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  return (
    <section ref={containerRef} className="relative h-[150vh] w-full bg-black select-none">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <motion.div 
             animate={{ 
               opacity: [0.05, 0.08, 0.05], 
               scale: [1, 1.05, 1],
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.1)_0%,_transparent_70%)] blur-[160px]" 
           />
        </div>

        <motion.div 
          style={{ scale, opacity, y }}
          className="relative z-10 w-full max-w-[1400px] mx-auto px-6 flex flex-col items-center"
        >
          <div className="relative mb-12 md:mb-20">
            <h1 className="text-[clamp(2.5rem,14vw,10.2rem)] font-bold tracking-tighter leading-[0.85] md:leading-[0.82] text-center text-white">
              Home for<br />
              <span className="text-white/10">communities.</span>
            </h1>
          </div>

          <div className="flex flex-col items-center gap-12 md:gap-16 w-full max-w-md md:max-w-none">
            <p className="text-base md:text-xl text-white/30 font-light leading-relaxed tracking-tight text-center max-w-xl text-balance px-4">
              Built for belonging.<br />
              Designed to last.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10 w-full md:w-auto px-4 md:px-0">
              <button 
                onClick={onEnter}
                className="w-full md:w-auto group relative px-12 py-5 rounded-full font-bold text-[10px] tracking-[0.4em] uppercase transition-all duration-700 hover:scale-105 active:scale-95 bg-white text-black"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Step Inside <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                </span>
              </button>

              <button 
                onClick={onReadManifesto}
                className="w-full md:w-auto px-8 py-5 rounded-full font-bold text-[10px] tracking-[0.4em] uppercase transition-all duration-700 hover:text-white text-white/40 border border-white/5 hover:border-white/20 bg-white/[0.02]"
              >
                Read the manifesto
              </button>
            </div>
          </div>
        </motion.div>

        {/* Scroll Affordance - Positioned for zero interference */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
          className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 md:gap-6"
        >
          <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.5em] mb-1">Scroll to enter</span>
          <div className="w-px h-8 md:h-10 bg-gradient-to-b from-white/10 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;