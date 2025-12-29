import React from 'react';
import { motion } from 'framer-motion';

const EditorialArtifact = ({ title, category, img, delay }: { title: string, category: string, img: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-5%" }}
    transition={{ duration: 2.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="group relative flex flex-col items-center gap-12 py-32 border-b border-white/[0.03] last:border-0"
  >
    <div className="w-full max-w-4xl aspect-[21/9] rounded-[60px] overflow-hidden bg-white/[0.02] border border-white/5 relative">
      <img 
        src={img} 
        alt={title} 
        className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-60 group-hover:scale-105 transition-all duration-[5s]" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
    </div>
    <div className="text-center space-y-4 max-w-md">
      <span className="text-[8px] font-black text-white/20 uppercase tracking-[1em] block mb-4">{category}</span>
      <h3 className="text-3xl md:text-5xl font-bold text-white/90 tracking-tight group-hover:text-white transition-colors">{title}</h3>
      <p className="text-sm text-white/10 group-hover:text-white/30 transition-colors tracking-widest uppercase font-bold">Featured</p>
    </div>
  </motion.div>
);

const ExploreSection: React.FC = () => {
  return (
    <section id="explore-marketing" className="relative w-full bg-black py-80 px-6 overflow-hidden border-t border-white/[0.02]">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <header className="text-center mb-64">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.1 }}
            viewport={{ once: true }}
            className="text-[10px] font-black text-white uppercase tracking-[1em] mb-20 select-none"
          >
            Explore
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="space-y-12"
          >
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-none">
              Find spaces worth entering.
            </h3>
            <p className="text-base md:text-lg text-white/20 font-light tracking-widest uppercase max-w-2xl mx-auto">
              Not everything is for you — and that’s the point.
            </p>
          </motion.div>
        </header>

        <div className="space-y-0 max-w-5xl mx-auto">
          <EditorialArtifact 
            title="Design Systems Mastery"
            category="Design"
            img="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop"
            delay={0.2}
          />
          <EditorialArtifact 
            title="Creative Code"
            category="Development"
            img="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2574&auto=format&fit=crop"
            delay={0.4}
          />
          <EditorialArtifact 
            title="Zen Architecture"
            category="Wellness"
            img="https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=2673&auto=format&fit=crop"
            delay={0.6}
          />
        </div>

        <footer className="mt-64 text-center">
            <button className="group text-[9px] font-black text-white/10 uppercase tracking-[0.8em] mx-auto transition-all hover:text-white">
              View the Archive
            </button>
        </footer>
      </div>
    </section>
  );
};

export default ExploreSection;