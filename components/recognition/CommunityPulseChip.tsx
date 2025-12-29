import React from 'react';
import { Activity } from 'lucide-react';

const CommunityPulseChip: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 group cursor-help transition-all hover:bg-green-500/20">
      <div className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest">Recognition active</span>
      
      {/* Hidden Tooltip */}
      <div className="absolute top-full mt-2 w-48 p-2 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        This community acknowledges participation. Signals are weighted seasonally.
      </div>
    </div>
  );
};

export default CommunityPulseChip;