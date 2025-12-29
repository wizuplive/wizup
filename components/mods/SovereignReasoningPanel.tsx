
import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { SovereignReasoningArtifact } from '../../types/sovereignReasoningTypes';
import { motion, AnimatePresence } from 'framer-motion';

interface SovereignReasoningPanelProps {
  artifact: SovereignReasoningArtifact;
}

const SovereignReasoningPanel: React.FC<SovereignReasoningPanelProps> = ({ artifact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-white/5 pt-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group mb-2"
      >
        <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400/70" />
            <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">Sovereign Reasoning</span>
        </div>
        {isExpanded ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4 px-5 bg-purple-900/[0.03] border border-purple-500/10 rounded-xl mt-2 space-y-5">
                
                {/* HEADLINE & SUMMARY */}
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-1.5">{artifact.headline}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                        {artifact.summary}
                    </p>
                </div>

                {/* SIGNALS */}
                <div>
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-2">Qualitative Signals</span>
                    <div className="flex flex-wrap gap-2">
                        {artifact.signals.map((sig, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-gray-400 font-medium">
                                {sig}
                            </span>
                        ))}
                    </div>
                </div>

                {/* UNCERTAINTY & HUMAN NEXT */}
                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-white/5">
                    <div>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-1">What this does not assume</span>
                        <p className="text-[10px] text-gray-400 italic">
                            {artifact.uncertainty}
                        </p>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Suggested review lens</span>
                        <p className="text-[10px] text-gray-300">
                            {artifact.humanNext}
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-end pt-2">
                    <span className="text-[9px] text-gray-600">{artifact.policyBasis}</span>
                    <span className="text-[8px] text-gray-700 uppercase tracking-wide">{artifact.scopeNote}</span>
                </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SovereignReasoningPanel;
