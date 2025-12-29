
import React, { useEffect, useState } from 'react';
import { 
  X, Users, ShieldCheck, ArrowRight, CheckCircle2, 
  Zap, Star, PlayCircle, MessageCircle, Layers 
} from 'lucide-react';
import { DashboardCommunity } from '../../types';

interface CommunityPreviewModalProps {
  community: DashboardCommunity;
  onClose: () => void;
  onViewFull: () => void;
  onJoin?: () => void;
}

const CommunityPreviewModal: React.FC<CommunityPreviewModalProps> = ({ community, onClose, onViewFull, onJoin }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleFullView = () => {
    setIsVisible(false);
    setTimeout(onViewFull, 200);
  };

  // Dynamic feature bullets based on category logic (mock)
  const getFeatures = () => {
    if (community.category === 'Design' || community.category === 'Creativity') {
      return [
        { icon: Layers, text: "Access to source files & assets" },
        { icon: PlayCircle, text: "Weekly live workshops" },
        { icon: MessageCircle, text: "Private critique channels" }
      ];
    }
    if (community.category === 'Development' || community.category === 'Tech') {
        return [
          { icon: Zap, text: "Smart Contract Templates" },
          { icon: Users, text: "Co-founder matching" },
          { icon: ShieldCheck, text: "Code Audits" }
        ];
    }
    return [
      { icon: Star, text: "Exclusive content drops" },
      { icon: Users, text: "Member-only events" },
      { icon: CheckCircle2, text: "Direct creator access" }
    ];
  };

  const features = getFeatures();

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-500"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden transform transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-white/10 text-white border border-white/5 backdrop-blur-md transition-colors"
        >
          <X size={18} />
        </button>

        {/* Hero Image */}
        <div className="relative h-48 w-full">
          <img 
            src={community.image} 
            alt={community.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0F0F0F]" />
          
          {/* Floating Tags */}
          <div className="absolute top-4 left-4 flex gap-2">
             {community.isFeatured && (
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 backdrop-blur-md text-[10px] font-bold text-yellow-200 uppercase tracking-wider flex items-center gap-1">
                   <Star size={10} fill="currentColor" /> Featured
                </span>
             )}
             <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                {community.category}
             </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-8 pb-8 -mt-10 relative z-10">
           
           {/* Avatar & Title */}
           <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-[24px] p-1 bg-[#0F0F0F] shadow-2xl mb-3">
                 <img 
                   src={community.image} 
                   alt="Avatar" 
                   className="w-full h-full object-cover rounded-[20px] border border-white/10" 
                 />
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight mb-1">{community.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                 <span className="font-medium text-white">{community.creator.name}</span>
                 {community.creator.verified && <ShieldCheck size={12} className="text-blue-400" />}
                 <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
                 <span>{community.members} Members</span>
              </div>
           </div>

           {/* Description */}
           <p className="text-sm text-gray-300 font-light leading-relaxed text-center mb-8 line-clamp-3">
              {community.description}
           </p>

           {/* Feature List */}
           <div className="bg-white/5 border border-white/5 rounded-2xl p-1 mb-8">
              {features.map((feat, idx) => (
                 <div key={idx} className="flex items-center gap-3 p-3 border-b border-white/5 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-purple-300">
                       <feat.icon size={14} />
                    </div>
                    <span className="text-xs font-medium text-gray-200">{feat.text}</span>
                 </div>
              ))}
           </div>

           {/* Actions */}
           <div className="space-y-3">
              <button 
                onClick={handleFullView} // For demo, primary action opens full view to "Join"
                className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
              >
                 {community.accessType === 'free' ? 'Join Community' : 'Unlock Access'} 
                 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleFullView}
                className="w-full py-3.5 rounded-2xl bg-white/5 text-white font-medium text-sm border border-white/5 hover:bg-white/10 transition-colors"
              >
                 View Full Page
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default CommunityPreviewModal;
