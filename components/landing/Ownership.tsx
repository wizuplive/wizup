import React from 'react';
import { motion } from 'framer-motion';

const Ownership: React.FC = () => {
  return (
    <section className="py-40 md:py-60 bg-black border-t border-white/5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-24">
        
        <div className="flex-1">
           <motion.h2 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
             className="text-5xl md:text-7xl font-medium text-white mb-10 tracking-tighter leading-[1.1]"
           >
              Your connections<br />persist.
           </motion.h2>
           <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 0.4 }}
             viewport={{ once: true }}
             transition={{ duration: 1.5, delay: 0.6 }}
             className="space-y-12"
           >
             <p className="text-xl text-white font-light leading-relaxed max-w-md">
                They don't belong to feeds, trends, or platforms. 
                They belong to the spaces you build — and the people inside them.
             </p>
             <div className="flex flex-col gap-6">
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.4em] border-b border-white/5 pb-4 w-fit italic">Presence with memory</span>
             </div>
           </motion.div>
        </div>

        <div className="flex-1 flex justify-center relative">
           {/* Abstract Network Graphic - Ultra Slow Drift */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
             className="relative w-96 h-96 opacity-40"
           >
              <div className="absolute top-0 left-0 w-48 h-48 border-l border-t border-white/10 rounded-tl-[4rem]" />
              <div className="absolute bottom-0 right-0 w-48 h-48 border-r border-b border-white/10 rounded-br-[4rem]" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-48 h-48 bg-gradient-to-br from-white/5 to-transparent rounded-full backdrop-blur-2xl border border-white/5 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full" />
                 </div>
              </div>
              
              {/* Nodes */}
              {[0, 1, 2, 3].map(i => (
                 <motion.div 
                   key={i}
                   className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]"
                   style={{ 
                      top: `${20 + i * 20}%`, 
                      left: `${20 + (i % 2) * 60}%` 
                   }}
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                   transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
                 />
              ))}
              
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.05)" />
                 <line x1="80%" y1="40%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.05)" />
                 <line x1="20%" y1="60%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.05)" />
              </svg>
           </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Ownership;