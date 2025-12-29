
import React, { useState } from 'react';
import { ChevronRight, GitMerge, AlertCircle, Shield, Check, Info } from 'lucide-react';
import { ConsensusAnalysis, ConsensusStatus } from '../../types/modTypes';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsensusStripProps {
  analysis: ConsensusAnalysis;
}

const ConsensusStrip: React.FC<ConsensusStripProps> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // V4 Color Logic: Muted Amber for uncertainty/contention, never red.
  const getStatusColor = (status: ConsensusStatus) => {
    switch (status) {
        case 'CONTESTED': return 'text-amber-200 border-amber-500/30 bg-amber-500/10';
        case 'UNCERTAIN': return 'text-zinc-200 border-zinc-500/30 bg-zinc-500/10';
        default: return 'text-green-200 border-green-500/30 bg-green-500/10';
    }
  };

  const getIcon = (status: ConsensusStatus) => {
      switch (status) {
          case 'CONTESTED': return <GitMerge size={14} className="text-amber-400" />;
          case 'UNCERTAIN': return <Info size={14} className="text-zinc-400" />;
          default: return <Check size={14} className="text-green-400" />;
      }
  };

  // Only show strip if not simply aligned (unless we want to show positive confirmation)
  // V4 Philosophy: "Humans see consensus, not debate". 
  // We primarily show this when there is something worth seeing (Uncertain/Contested).
  if (analysis.status === 'ALIGNED') return null; 

  return (
    <div className="mb-6">
      <motion.div 
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative overflow-hidden rounded-xl border cursor-pointer transition-colors group ${getStatusColor(analysis.status)}`}
      >
        {/* COLLAPSED STATE */}
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-black/20 ${analysis.status === 'CONTESTED' ? 'animate-pulse' : ''}`}>
                    {getIcon(analysis.status)}
                </div>
                <div>
                    <h3 className="text-sm font-bold tracking-tight mb-0.5">{analysis.headline}</h3>
                    <div className="flex gap-2">
                        {analysis.signals.map((sig, i) => (
                            <span key={i} className="text-[10px] opacity-70 font-medium uppercase tracking-wide">
                                {sig}{i < analysis.signals.length -1 ? ' • ' : ''}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
            </div>
        </div>

        {/* EXPANDED STATE (AGENT LENS) */}
        <AnimatePresence>
            {isExpanded && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-black/10 bg-black/5"
                >
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Reasoning Layers</span>
                            <span className="text-[10px] font-medium opacity-50">Read-Only</span>
                        </div>
                        
                        <div className="space-y-3">
                            {analysis.perspectives.map((perspective) => (
                                <div key={perspective.id} className="flex gap-3 text-xs">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 opacity-40 shrink-0" />
                                    <div>
                                        <span className="font-bold opacity-80 block mb-0.5">
                                            {perspective.leaning === 'RISK' ? 'Critical Interpretation' : 'Contextual Interpretation'}
                                        </span>
                                        <p className="leading-relaxed opacity-70">
                                            {perspective.observation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-2">
                            <p className="text-[10px] opacity-50 italic text-center">
                                Agents have deferred to human judgment for final decision.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ConsensusStrip;
