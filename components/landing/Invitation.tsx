import React from 'react';
import { motion } from 'framer-motion';

const Invitation: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <section className="py-[40rem] bg-black flex flex-col items-center justify-center text-center px-8 relative overflow-hidden border-t border-white/[0.02]">
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-[20rem]">
         <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true, margin: "-10%" }}
           transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
         >
            <h2 className="text-6xl md:text-[9rem] lg:text-[12rem] font-bold text-white tracking-tighter leading-none select-none">
              Step inside.
            </h2>
            <div className="mt-20 flex flex-col gap-8 text-lg md:text-xl text-white/20 font-light tracking-[0.4em] uppercase">
                <p>Belonging is intentional.</p>
            </div>
         </motion.div>

         <div className="pt-20">
           <motion.button 
             onClick={onEnter}
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 2, delay: 1.5 }}
             className="px-20 py-8 bg-white text-black rounded-full font-bold text-[10px] tracking-[0.6em] uppercase transition-all duration-1000 shadow-[0_0_100px_rgba(255,255,255,0.1)] relative overflow-hidden group active:scale-95"
           >
              <span className="relative z-10 group-hover:tracking-[0.8em] transition-all duration-1000">Join WIZUP</span>
              <div className="absolute inset-0 bg-gray-100 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-1000" />
           </motion.button>
         </div>

         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 0.05 }}
           viewport={{ once: true }}
           transition={{ duration: 4, delay: 2.5 }}
           className="text-[10px] uppercase tracking-[1em] font-black pt-64"
         >
           You belong here.
         </motion.div>
      </div>
    </section>
  );
};

export default Invitation;