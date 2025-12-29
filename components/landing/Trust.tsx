
import React from 'react';

const Trust: React.FC = () => {
  return (
    <section className="py-32 bg-[#000] text-center border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        
        <h3 className="text-sm font-medium text-gray-500 mb-16 tracking-widest uppercase">Recognized by the people building what's next</h3>

        <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-30 hover:opacity-60 transition-opacity duration-700 grayscale">
           <span className="text-xl font-bold font-serif tracking-widest text-white">VOGUE</span>
           <span className="text-xl font-bold tracking-tighter text-white">WIRED</span>
           <span className="text-xl font-bold tracking-widest text-white">stripe</span>
           <span className="text-xl font-bold font-mono tracking-tighter text-white">VERCEL</span>
        </div>

        <p className="mt-24 text-sm text-gray-600 font-light">
           Creators. Educators. Communities.<br/>
           All choosing presence over platforms.
        </p>

      </div>
    </section>
  );
};

export default Trust;
