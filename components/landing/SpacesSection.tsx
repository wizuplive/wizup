import React, { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SpacePanelProps {
  title: string;
  philosophy: string;
  hoverMicroCopy: string;
  img: string;
  accentColor: string;
  parallaxSpeed: number;
  isHero?: boolean;
  isWildcard?: boolean;
  onClick: () => void;
}

const SpacePanel = ({ title, philosophy, hoverMicroCopy, img, accentColor, parallaxSpeed, isHero, isWildcard, onClick }: SpacePanelProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed]);
  
  if (isWildcard) {
    return (
      <motion.div
        ref={ref}
        style={{ y }}
        onClick={onClick}
        whileTap={{ scale: 0.995, filter: "brightness(1.05)" }}
        className="group relative flex flex-col justify-center p-12 md:p-16 bg-white/[0.01] border border-white/5 rounded-[48px] md:rounded-[64px] cursor-pointer hover:bg-white/[0.02] transition-all duration-1000 overflow-hidden min-h-[80vh] md:min-h-[400px] w-full"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] blur-[120px] pointer-events-none" />
        <div className="space-y-6 relative z-10">
          <span className="text-[8px] font-black text-white/10 uppercase tracking-[1.2em] block">Preservation</span>
          <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-tight">Archives</h3>
          
          <div className="relative h-20 md:h-24">
            <p className="text-sm md:text-base text-white/30 font-light leading-relaxed tracking-tight max-w-xs group-hover:opacity-0 transition-all duration-700">
              Where ideas, conversations, and history remain accessible — long after the moment passes.
            </p>
            <p className="absolute top-0 left-0 text-sm md:text-lg text-white/70 font-medium leading-relaxed tracking-tight max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-100 italic">
              {hoverMicroCopy}
            </p>
          </div>

          <div className="pt-8 flex items-center gap-4 opacity-30 md:opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000">
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/40">Observe</span>
            <ArrowRight size={18} className="text-white/40" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      onClick={onClick}
      whileTap={{ 
        scale: 0.995, 
        filter: "contrast(1.05) brightness(1.05)"
      }}
      className={`group relative rounded-[48px] md:rounded-[64px] overflow-hidden bg-black border border-white/5 cursor-pointer hover:-translate-y-1 transition-all duration-1000 w-full shadow-2xl ${
        isHero ? 'min-h-[85vh] md:aspect-auto md:h-[720px]' : 'min-h-[85vh] md:aspect-square'
      }`}
    >
      {/* Layer 1: Cinematic Image with Soft Grain & Depth Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover grayscale opacity-20 filter contrast-[1.1] brightness-[1.1] transition-all duration-[4s] ease-cinematic group-hover:grayscale-[60%] group-hover:opacity-40 group-hover:brightness-100" 
        />
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply transition-colors duration-1000 group-hover:bg-black/20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      </div>

      {/* Layer 2: Ambient Gradient Field (Breathing & Drift) */}
      <motion.div 
        animate={{ 
          opacity: [0.03, 0.08, 0.03],
          scale: [1, 1.05, 1],
          x: [0, 15, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${accentColor}11 0%, transparent 80%)` 
        }}
      />

      {/* Layer 3: Minimal Identity Overlay */}
      <div className="absolute inset-0 z-20 p-12 md:p-16 flex flex-col justify-end">
        <div className="space-y-6 max-w-md">
          {/* Presence Indicator */}
          <div className="flex items-center gap-3 opacity-30 md:opacity-30 group-hover:opacity-100 transition-opacity duration-1000">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
             <span className="text-[9px] font-black text-white uppercase tracking-[0.6em]">Active Now</span>
          </div>
          
          <div className="space-y-2 transform transition-transform duration-1000 group-hover:translate-x-1">
            <h3 className={`font-bold text-white tracking-tighter leading-none ${isHero ? 'text-5xl md:text-8xl' : 'text-4xl md:text-4xl'}`}>
              {title}
            </h3>
            
            <div className="relative h-12 md:h-16">
              <p className="text-sm md:text-lg text-white/30 font-light leading-relaxed tracking-tight group-hover:opacity-0 transition-all duration-700">
                {philosophy}
              </p>
              <p className="absolute top-0 left-0 text-sm md:text-xl text-white/70 font-medium leading-relaxed tracking-tight opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-100">
                {hoverMicroCopy}
              </p>
            </div>
          </div>

          {/* Action Verb Fade-in */}
          <div className="pt-8 flex items-center gap-4 opacity-40 md:opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 delay-150">
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white">Enter</span>
            <ArrowRight size={16} className="text-white" />
          </div>
        </div>
      </div>

      {/* Aura Edge Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-30"
        style={{ boxShadow: `inset 0 0 120px -40px ${accentColor}08` }}
      />
      <div className="absolute inset-0 border border-transparent transition-all duration-1000 group-hover:border-white/10" />
    </motion.div>
  );
};

const SpacesSection: React.FC<{ onEnterSpace: (id: number) => void }> = ({ onEnterSpace }) => {
  return (
    <section id="spaces-marketing" className="relative w-full bg-black py-48 md:py-80 px-6 overflow-hidden border-t border-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-48 md:mb-64">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.1 }}
            viewport={{ once: true }}
            className="text-[10px] font-black text-white uppercase tracking-[1.2em] mb-16"
          >
            Spaces
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10 md:space-y-14"
          >
            <h3 className="text-5xl md:text-[9rem] font-bold text-white tracking-tighter leading-[0.82] select-none text-balance">
              Places people choose<br /> to show up.
            </h3>
            <p className="text-lg md:text-2xl text-white/30 font-light tracking-tight max-w-3xl mx-auto text-balance leading-relaxed">
              Spaces are focused environments for learning, collaboration, and belonging — designed for presence, not noise.
            </p>
          </motion.div>
        </header>

        {/* Asymmetric Editorial Grid - Immersive Stack on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-32 md:gap-16 lg:gap-20 mb-64 items-stretch">
          
          {/* Row 1: Hero Dominant */}
          <div className="md:col-span-8 flex">
            <SpacePanel 
              isHero
              title="Design Systems"
              philosophy="Mastery of consistency, clarity, and scale at any stage."
              hoverMicroCopy="Build once. Scale with clarity."
              img="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop"
              accentColor="#a855f7"
              parallaxSpeed={-60}
              onClick={() => onEnterSpace(1)}
            />
          </div>

          {/* Row 1: Supporting Panel */}
          <div className="md:col-span-4 flex flex-col justify-end">
            <SpacePanel 
              title="Writing Circles"
              philosophy="Reflection, feedback, and shared growth."
              hoverMicroCopy="Think together. Write forward."
              img="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2574&auto=format&fit=crop"
              accentColor="#3b82f6"
              parallaxSpeed={40}
              onClick={() => onEnterSpace(3)}
            />
          </div>

          {/* Row 2: Wildcard (Archive Focus) */}
          <div className="md:col-span-4 flex">
            <SpacePanel 
              isWildcard
              title="Archives"
              philosophy="Where ideas, conversations, and history remain accessible — long after the moment passes."
              hoverMicroCopy="What matters stays."
              img=""
              accentColor="#f59e0b"
              parallaxSpeed={20}
              onClick={() => {}}
            />
          </div>

          {/* Row 2: Secondary Hero */}
          <div className="md:col-span-8 flex">
            <SpacePanel 
              isHero
              title="Founder Rooms"
              philosophy="High-intent environments for navigating real decisions."
              hoverMicroCopy="Decisions made with intention."
              img="https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=2673&auto=format&fit=crop"
              accentColor="#22c55e"
              parallaxSpeed={-30}
              onClick={() => onEnterSpace(4)}
            />
          </div>
        </div>

        {/* Institutional Narratives */}
        <div className="pt-48 border-t border-white/[0.03] max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-20 md:gap-y-24">
                {[
                    "Nothing disappears.",
                    "Privacy is the default.",
                    "Memory is structural.",
                    "Spaces endure."
                ].map((line, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-10 group"
                    >
                        <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-purple-500/50 transition-all duration-1000 shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                        <span className="text-3xl md:text-5xl font-light text-white/20 group-hover:text-white transition-colors duration-1000 tracking-tighter">
                            {line}
                        </span>
                    </motion.div>
                ))}
            </div>

            <footer className="mt-64 text-center">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="group flex flex-col items-center gap-10 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[1em] transition-all mx-auto"
                >
                    <span>EXPLORE SPACES</span>
                    <div className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent group-hover:h-32 transition-all duration-1000" />
                </button>
            </footer>
        </div>
      </div>
    </section>
  );
};

export default SpacesSection;
