
import React from 'react';
import { Sparkles } from 'lucide-react';

const CreationPower: React.FC = () => {
  return (
    <section className="py-40 bg-[#000] border-t border-white/5 flex flex-col items-center justify-center">
      
      <div className="max-w-4xl mx-auto px-6 w-full text-center">
         <h2 className="text-3xl md:text-5xl font-medium text-white mb-12 tracking-tight">Shape worlds before they exist.</h2>
         
         <div className="relative max-w-2xl mx-auto group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {/* Interface */}
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
               <div className="p-4 text-gray-500">
                  <Sparkles size={20} />
               </div>
               <div className="h-12 flex-1 flex items-center text-lg md:text-xl text-gray-600 font-light italic">
                  Describe your vision...
               </div>
               <div className="px-6 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  WIZUP AI
               </div>
            </div>
         </div>

         <p className="mt-12 text-sm text-gray-600 font-mono">WIZUP brings intent to form.</p>
      </div>

    </section>
  );
};

export default CreationPower;
