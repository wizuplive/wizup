
import React from 'react';
import { Play, Info, Check, Clock, Star, Heart, Share2, Sparkles } from 'lucide-react';

const WizPremiereView: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-[#050505] overflow-hidden text-white selection:bg-purple-500/30">
      
      {/* --- Cinematic Background Layer --- */}
      <div className="absolute inset-0 z-0">
        {/* Blurred Backdrop Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620428268482-cf1851a36764?q=80&w=2609&auto=format&fit=crop')] bg-cover bg-center blur-3xl opacity-30 scale-110 animate-pulse-slow" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 mix-blend-overlay" />
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-20">
        
        {/* --- Header / Title Section --- */}
        <div className="flex flex-col items-center text-center mb-12 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-2xl">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">WIZ Premiere Original</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-4 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400">
             WIZ THE PANDA
           </h1>
           
           <p className="text-lg md:text-2xl font-light text-gray-300 max-w-3xl leading-relaxed drop-shadow-lg">
             A Hollywood-level AI animation brought to life by 6 visionary animators.
           </p>
        </div>

        {/* --- Main Content Area --- */}
        <div className="w-full max-w-5xl mx-auto">
           
           {/* Video Player Container */}
           <div className="relative aspect-video w-full rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(168,85,247,0.15)] group cursor-pointer bg-black animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Video Thumbnail */}
              <img 
                src="https://images.unsplash.com/photo-1620428268482-cf1851a36764?q=80&w=2609&auto=format&fit=crop" 
                alt="Wiz The Panda Trailer" 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
              />
              
              {/* Player Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Play Button Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                       <Play size={32} fill="currentColor" />
                    </div>
                 </div>
              </div>

              {/* Player UI (Bottom) */}
              <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
                 <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-bold text-white border border-white/10 uppercase tracking-wider">Trailer</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-300 bg-black/40 px-3 py-1 rounded-md backdrop-blur-md">
                       <Clock size={14} /> 2:45
                    </span>
                 </div>
                 <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"><Heart size={20} /></button>
                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"><Share2 size={20} /></button>
                 </div>
              </div>
           </div>

           {/* Metadata & Details Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              
              {/* Left: Credits */}
              <div className="md:col-span-2 space-y-8">
                 <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Storyline</h3>
                    <p className="text-gray-300 font-light leading-relaxed text-lg">
                       In a futuristic bamboo metropolis powered by neural networks, Wiz discovers an ancient algorithm that could rewrite the code of nature itself. 
                       Teaming up with a band of rogue animators, he must navigate the digital canopy before the glitched overlords delete his source code.
                    </p>
                 </div>
                 
                 <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Created By</h3>
                    <div className="flex flex-wrap gap-4">
                       {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="flex items-center gap-3 p-2 pr-4 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                             <img src={`https://picsum.photos/seed/animator${i}/100/100`} className="w-10 h-10 rounded-full object-cover" alt="Artist" />
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Artist Name</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Animator</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Right: Actions & Meta */}
              <div className="space-y-6">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                          <Star size={24} fill="currentColor" />
                       </div>
                       <div>
                          <div className="text-lg font-bold text-white">4.9/5.0</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Community Rating</div>
                       </div>
                    </div>
                    <button className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                       Enter Premiere Experience
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                       Exclusive access for WIZ Premiere members.
                    </p>
                 </div>

                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                       <Info size={16} className="text-blue-400" /> Behind the Scenes
                    </h4>
                    <ul className="space-y-3">
                       {['AI Production Pipeline', 'Character Rigging', 'Lighting Breakdown'].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">
                             <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                             {item}
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>

           </div>

        </div>

      </div>
    </div>
  );
};

export default WizPremiereView;
