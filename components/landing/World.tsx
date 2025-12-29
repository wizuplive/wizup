import React from 'react';
import { motion } from 'framer-motion';

const WorldTile = ({ name, ethos, img, size = 'normal' }: { name: string, ethos: string, img: string, size?: 'large' | 'normal' }) => (
  <div 
    className={`
      group relative overflow-hidden bg-black border-b border-r border-white/[0.02] cursor-pointer
      ${size === 'large' ? 'col-span-1 md:col-span-2 aspect-[21/9]' : 'col-span-1 aspect-square'}
    `}
  >
     <div className="absolute inset-0 opacity-20 group-hover:opacity-60 transition-opacity duration-[2s]">
        <img src={img} alt={name} className="w-full h-full object-cover grayscale transition-all duration-[3s] ease-out group-hover:scale-105 group-hover:contrast-125" />
     </div>
     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
     
     <div className="absolute bottom-0 left-0 p-12 md:p-16 w-full">
        <div className="flex justify-between items-end">
           <div className="space-y-4">
              <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tighter leading-none">{name}</h3>
              <p className="text-white/10 group-hover:text-white/30 transition-colors font-bold text-[9px] tracking-[0.4em] uppercase">{ethos}</p>
           </div>
           <motion.div 
             whileHover={{ scale: 1.5 }}
             className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 mb-2 shadow-[0_0_10px_white]" 
           />
        </div>
     </div>
  </div>
);

const World: React.FC = () => {
  return (
    <section className="bg-black border-t border-white/[0.02]">
      <div className="w-full">
        
        <div className="px-6 py-40 md:py-64 max-w-7xl mx-auto text-center">
           <motion.h2 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 0.1 }}
             viewport={{ once: true }}
             transition={{ duration: 1.5 }}
             className="text-[9px] font-bold text-white uppercase tracking-[0.5em] mb-10"
           >
             Spaces that endure
           </motion.h2>
           <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1.5, delay: 0.2 }}
             className="text-4xl md:text-[6.5rem] font-bold text-white tracking-tighter leading-[0.85] select-none"
           >
              Spaces are <br />entered — <br /><span className="text-white/5">not followed.</span>
           </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/[0.02]">
           <WorldTile 
             name="Design Systems" 
             ethos="Consistency compounds." 
             img="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop"
             size="large"
           />
           <WorldTile 
             name="Web3 Builders" 
             ethos="Signal survives cycles." 
             img="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2574&auto=format&fit=crop"
           />
           <WorldTile 
             name="Zen Masters" 
             ethos="Presence slows time." 
             img="https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=2673&auto=format&fit=crop"
           />
           <WorldTile 
             name="AI Architects" 
             ethos="Building the future together." 
             img="https://images.unsplash.com/photo-1531297461136-82af022f0b79?q=80&w=2548&auto=format&fit=crop"
             size="large"
           />
        </div>
        
        <div className="py-24 text-center border-t border-white/[0.02] bg-black">
           <p className="text-[10px] text-white/5 font-bold tracking-[0.4em] uppercase">Identity Persists Here.</p>
        </div>

      </div>
    </section>
  );
};

export default World;