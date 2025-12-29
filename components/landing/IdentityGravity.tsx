import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ title, tagline, subline, img, index }: { title: string, tagline: string, subline: string, img: string, index: number }) => {
  return (
    <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-black overflow-hidden border-t border-white/[0.02]">
      <div className="relative w-full h-full max-w-[1500px] mx-auto flex flex-col md:flex-row items-center px-8">
          
          {/* Text Content Layer */}
          <div className="w-full md:w-1/2 p-12 md:p-32 z-20 flex flex-col justify-center h-full">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-15%" }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                  <span className="text-[9px] font-bold text-white/15 uppercase tracking-[0.5em] mb-12 block">
                    0{index + 1} — Structural Pillar
                  </span>
                  <h3 className="text-7xl md:text-[10rem] font-bold text-white mb-16 tracking-tighter leading-[0.82] select-none">
                      {title}
                  </h3>
                  <div className="space-y-6">
                    <motion.p 
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.4 }}
                      className="text-xl md:text-3xl text-white/30 font-light max-w-md leading-tight tracking-tighter"
                    >
                        {tagline}
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.8 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.8 }}
                      className="text-sm text-white/80 font-light max-w-xs leading-relaxed"
                    >
                        {subline}
                    </motion.p>
                  </div>
              </motion.div>
          </div>

          {/* Visual Layer */}
          <div className="absolute inset-0 md:relative md:w-1/2 h-[75vh] md:h-[85vh] rounded-[60px] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black z-10 md:bg-gradient-to-l md:via-black/20" />
              <motion.div 
                className="w-full h-full"
                initial={{ scale: 1.05, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
              >
                  <img 
                    src={img} 
                    alt={title} 
                    className="w-full h-full object-cover grayscale brightness-110 filter contrast-125 transition-transform duration-[5s] group-hover:scale-110" 
                  />
              </motion.div>
              
              <div className="absolute inset-0 bg-purple-500/[0.02] mix-blend-overlay z-10" />
          </div>

      </div>
    </div>
  );
};

const IdentityGravity: React.FC = () => {
  return (
    <section className="bg-black relative">
      <div className="py-64 px-8 max-w-7xl mx-auto text-center">
         <h2 className="text-[10px] font-bold text-white/15 uppercase tracking-[0.5em] mb-16">The Reframe</h2>
         <p className="text-5xl md:text-[7rem] font-bold text-white tracking-tighter leading-[0.85] mb-8 select-none">
            Depth, not volume.
         </p>
         <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 0.3 }}
           viewport={{ once: true }}
           transition={{ duration: 1.5, delay: 0.6 }}
           className="space-y-4"
         >
           <p className="text-xl md:text-3xl text-white font-light tracking-tighter">
             Relationships that grow stronger the longer you show up.
           </p>
           <p className="text-sm font-bold uppercase tracking-[0.2em]">
             Presence compounds. History matters.
           </p>
         </motion.div>
      </div>
      
      <div className="relative">
         <Card 
           index={0}
           title="Create"
           tagline="Build once. Belong for a lifetime."
           subline="No resets. No algorithmic overrides. What you create stays yours."
           img="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop"
         />
         <Card 
           index={1}
           title="Move"
           tagline="Move freely. Stay intact."
           subline="Your identity moves with you. Your history carries weight. Nothing starts from zero again."
           img="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"
         />
         <Card 
           index={2}
           title="Sustain"
           tagline="Cultivate ecosystems of trust."
           subline="From broadcasting to belonging. Durable relationships that outlive trends."
           img="https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2670&auto=format&fit=crop"
         />
      </div>
    </section>
  );
};

export default IdentityGravity;