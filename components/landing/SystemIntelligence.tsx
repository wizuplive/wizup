import React from 'react';
import { Network, Shield, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemIntelligence: React.FC = () => {
  const itemTransition = { duration: 1.2, ease: [0.16, 1, 0.3, 1] };

  return (
    <section className="py-40 bg-[#000] border-t border-white/[0.02] flex flex-col items-center justify-center text-center px-6">
      
      <div className="max-w-5xl mx-auto w-full">
         <motion.h2 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 0.2 }}
           viewport={{ once: true }}
           transition={itemTransition}
           className="text-[9px] font-bold text-white uppercase tracking-[0.4em] mb-12 italic"
         >
           Intelligence
         </motion.h2>
         
         <motion.h3 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ ...itemTransition, delay: 0.2 }}
           className="text-4xl md:text-7xl font-medium text-white mb-20 tracking-tighter"
         >
            Coordination without control.
         </motion.h3>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-left max-w-4xl mx-auto mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...itemTransition, delay: 0.4 }}
              className="space-y-6 group"
            >
               <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-white transition-all duration-700 group-hover:scale-[1.04]">
                  <Shield size={16} />
               </div>
               <h4 className="text-white/80 font-medium text-sm uppercase tracking-widest">Safety that adapts</h4>
               <p className="text-white/30 text-xs leading-relaxed group-hover:text-white/50 transition-colors">
                  Communities protect what matters to them. Safety is context-aware and norm-driven.
               </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...itemTransition, delay: 0.6 }}
              className="space-y-6 group"
            >
               <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-white transition-all duration-700 group-hover:scale-[1.04]">
                  <Network size={16} />
               </div>
               <h4 className="text-white/80 font-medium text-sm uppercase tracking-widest">Signals that connect</h4>
               <p className="text-white/30 text-xs leading-relaxed group-hover:text-white/50 transition-colors">
                  Alignment replaces cold outreach. The graph connects people through shared history.
               </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...itemTransition, delay: 0.8 }}
              className="space-y-6 group"
            >
               <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-white transition-all duration-700 group-hover:scale-[1.04]">
                  <Fingerprint size={16} />
               </div>
               <h4 className="text-white/80 font-medium text-sm uppercase tracking-widest">Authority you define</h4>
               <p className="text-white/30 text-xs leading-relaxed group-hover:text-white/50 transition-colors">
                  Power stays inside the space. Automated actors hold authority within boundaries you set.
               </p>
            </motion.div>
         </div>

         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ ...itemTransition, delay: 1 }}
           className="space-y-6"
         >
            <div className="inline-block px-8 py-4 border border-white/[0.05] rounded-full bg-white/[0.01]">
               <p className="text-xs text-white/30 font-medium">The work that fragments communities disappears.</p>
            </div>
            <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">What remains is trust.</p>
         </motion.div>
      </div>

    </section>
  );
};

export default SystemIntelligence;