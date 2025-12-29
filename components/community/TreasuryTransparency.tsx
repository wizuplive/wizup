import React, { useState, useEffect } from 'react';
import { Shield, Info, ChevronDown, ChevronRight, Clock, CheckCircle2, Lock } from 'lucide-react';
import { transparencyService, TreasuryTransparencyData, TransparencyRole } from '../../services/zapsTreasury/transparencyService';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  communityId: string;
  userId: string;
}

const TreasuryTransparency: React.FC<Props> = ({ communityId, userId }) => {
  const [data, setData] = useState<TreasuryTransparencyData | null>(null);
  const [role, setRole] = useState<TransparencyRole>('PUBLIC');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const r = transparencyService.resolveRole(userId, communityId);
      setRole(r);
      const d = await transparencyService.getTransparencyData(communityId, r);
      setData(d);
    };
    load();
  }, [communityId, userId]);

  if (!data) return null;

  const { status } = data;

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Primary Status Surface */}
      <div className="p-6 rounded-[28px] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center`}>
              <div className={`w-2 h-2 rounded-full ${
                status.color === 'green' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                status.color === 'yellow' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 
                'bg-blue-500 shadow-[0_0_10px_#3b82f6]'
              }`} />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Treasury Status</h4>
              <p className="text-sm font-bold text-white tracking-tight">{status.label}</p>
            </div>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-all"
          >
            {expanded ? 'Collapse' : 'Learn more'}
            <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <p className="mt-4 text-xs text-gray-400 font-light leading-relaxed">
          {status.subline}
        </p>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 space-y-8 border-t border-white/5 mt-6">
                
                {/* Intent Section */}
                {data.intent && (
                  <div className="space-y-2">
                    <h5 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Stewardship Intent</h5>
                    <p className="text-xs text-gray-300 font-light leading-relaxed italic">"{data.intent}"</p>
                  </div>
                )}

                {/* Mode Section (Creator+) */}
                {data.mode && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recent Mode</span>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{data.mode}</span>
                  </div>
                )}

                {/* Guardrails (Steward+) */}
                {data.guardrails && (
                  <div className="space-y-4">
                    <h5 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Active Guardrails</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {data.guardrails.map((g, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                          <CheckCircle2 size={12} className="text-gray-600" />
                          <span className="text-[11px] text-gray-400 font-medium">{g}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* History (Steward+) */}
                {data.historySummary && (
                  <div className="space-y-3">
                    <h5 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Context</h5>
                    <p className="text-[11px] text-gray-500">{data.historySummary}</p>
                    <div className="space-y-1">
                      {data.seasons?.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-gray-600">
                          <ChevronRight size={10} />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Freeze/Audit Details (Owner Only) */}
                {data.freezeDetails && (
                  <div className="p-6 rounded-3xl bg-red-900/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-4 text-red-400">
                       <Lock size={14} />
                       <h5 className="text-[10px] font-bold uppercase tracking-widest">Incident Record</h5>
                    </div>
                    <p className="text-xs text-red-100/70 mb-4">{data.freezeDetails.reason}</p>
                    <div className="space-y-2">
                       <span className="text-[9px] font-bold text-gray-600 uppercase">Recovery Requirements:</span>
                       {data.freezeDetails.checklist.map((c, i) => (
                         <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500 line-through decoration-gray-800">
                           <div className="w-1 h-1 rounded-full bg-gray-700" />
                           {c}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 text-center opacity-40">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">Stewardship is not a performance.</p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TreasuryTransparency;