
import React from 'react';
import { Shield, Activity, Lock, RefreshCw, X, BrainCircuit, Waves, GitMerge } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentOverviewPanelProps {
  onClose: () => void;
  mode: 'ASSIST' | 'AUTOPILOT' | 'SOVEREIGN';
}

const AgentOverviewPanel: React.FC<AgentOverviewPanelProps> = ({ onClose, mode }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
           <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                 mode === 'SOVEREIGN' ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' :
                 mode === 'AUTOPILOT' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
                 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                 <BrainCircuit size={20} />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-white">System Status</h2>
                 <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                    {mode === 'SOVEREIGN' ? 'Autonomous' : mode === 'AUTOPILOT' ? 'Active' : 'Standby'}
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Status Body */}
        <div className="p-8 pt-4 space-y-6">
           
           {/* Qualitative Pulse */}
           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Activity size={12} /> Current State
              </h3>
              <p className="text-xl font-medium text-white leading-tight">
                 Atmosphere is stable.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                 Pattern deviation is within nominal limits.
              </p>
           </div>

           {/* V4: AI COLLABORATION STATUS */}
           <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-white/5 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5 text-blue-300">
                 <GitMerge size={16} />
              </div>
              <div>
                 <h4 className="text-xs font-bold text-white mb-0.5">AI Collaboration Status</h4>
                 <p className="text-[10px] text-gray-400">Agents are aligned. Occasional uncertainty detected.</p>
              </div>
           </div>

           {/* Intervention Summary */}
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Interventions</div>
                 <div className="text-2xl font-bold text-white">3</div>
                 <div className="text-[10px] text-gray-500 mt-1">Quiet holds this week</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Overrides</div>
                 <div className="text-2xl font-bold text-white">0</div>
                 <div className="text-[10px] text-gray-500 mt-1">Human agreement 100%</div>
              </div>
           </div>

           {/* Philosophy Note */}
           <div className="flex gap-3 items-start p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <Waves size={16} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                 <h4 className="text-xs font-bold text-blue-300 mb-1">System Note</h4>
                 <p className="text-[11px] text-blue-200/70 leading-relaxed">
                    Agents are operating in background mode. Content flow is being regulated to preserve conversation quality without interrupting flow.
                 </p>
              </div>
           </div>

        </div>

      </div>
    </motion.div>
  );
};

export default AgentOverviewPanel;
