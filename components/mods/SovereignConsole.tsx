
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Lock, Eye, 
  Terminal, FileText, PauseCircle, Crown,
  CheckCircle2, AlertTriangle, Fingerprint,
  RefreshCw, Server, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { sovereignExecutionService } from '../../services/sovereignExecutionService';
import { SystemPulseState, SimulationResult } from '../../types/sovereignTypes';

interface SovereignConsoleProps {
  onBack: () => void;
  onPanicPause: () => void;
}

// --- SUBCOMPONENTS ---

const SystemPulse = ({ state }: { state: SystemPulseState }) => {
    const getColor = () => {
        switch(state) {
            case 'NOMINAL': return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
            case 'ELEVATED': return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
            case 'CALIBRATING': return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]';
            case 'PAUSED': return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#0F0F0F] border border-white/5">
            <div className="relative flex items-center justify-center w-3 h-3">
                <div className={`absolute inset-0 rounded-full opacity-20 animate-ping ${getColor()}`} />
                <div className={`w-2 h-2 rounded-full ${getColor()}`} />
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{state}</span>
        </div>
    );
};

const StatusCard = ({ label, value, icon: Icon, subtext }: any) => (
    <div className="bg-[#0F0F0F] border border-white/5 p-6 rounded-none first:rounded-l-2xl last:rounded-r-2xl border-r-0 last:border-r flex flex-col justify-between h-32 hover:bg-white/[0.02] transition-colors">
        <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</span>
            <Icon size={14} className="text-gray-500" />
        </div>
        <div>
            <div className="text-sm font-medium text-white mb-1">{value}</div>
            <div className="text-[10px] text-gray-500 font-mono">{subtext}</div>
        </div>
    </div>
);

const SimulationRow: React.FC<{ sim: SimulationResult }> = ({ sim }) => (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors text-xs">
        <div className="col-span-6 font-mono text-gray-400 truncate pr-4">
            {sim.contentSnippet}
        </div>
        <div className="col-span-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
            <span className="text-gray-300 font-medium">{sim.humanAction}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full border ${sim.agentHypothesis === 'HOLD' ? 'border-amber-500' : 'border-blue-500'}`} />
            <span className="text-gray-500">{sim.agentHypothesis}</span>
        </div>
        <div className="col-span-2 text-right">
            {sim.alignment === 'ALIGNED' ? (
                <span className="text-green-500/50 uppercase tracking-wider font-bold text-[9px]">Aligned</span>
            ) : (
                <span className="text-amber-500/50 uppercase tracking-wider font-bold text-[9px]">Diverged</span>
            )}
        </div>
    </div>
);

// --- MAIN CONSOLE ---

const SovereignConsole: React.FC<SovereignConsoleProps> = ({ onBack, onPanicPause }) => {
  const [activeTab, setActiveTab] = useState<'Operations' | 'Simulation' | 'Audit' | 'Contract'>('Operations');
  const [pulse, setPulse] = useState<SystemPulseState>('CALIBRATING');
  const [sims, setSims] = useState<SimulationResult[]>([]);

  useEffect(() => {
      // Simulate initialization
      setTimeout(() => setPulse('NOMINAL'), 1500);
      sovereignExecutionService.getSimulations('demo').then(setSims);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      className="h-full w-full bg-[#050505] flex flex-col relative overflow-hidden"
    >
       {/* Ambient Light (Subtle) */}
       <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-amber-900/5 blur-[150px] pointer-events-none" />

       {/* HEADER */}
       <div className="h-20 px-8 border-b border-white/5 flex items-center justify-between shrink-0 z-10 bg-[#050505]">
          <div className="flex items-center gap-6">
             <div className="w-10 h-10 flex items-center justify-center border border-amber-900/30 rounded-lg bg-amber-900/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <Crown size={18} strokeWidth={1.5} />
             </div>
             <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    Sovereign Console
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-gray-400 border border-white/5">v0 Shadow</span>
                </h2>
                <p className="text-[10px] text-gray-500 font-mono mt-1">ID: SA-8842-X • AUTH: GRANTED</p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             <SystemPulse state={pulse} />
             <div className="h-8 w-px bg-white/10" />
             <button 
               onClick={onPanicPause}
               className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-red-950/30 border border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
             >
                <PauseCircle size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Panic Pause</span>
             </button>
          </div>
       </div>

       {/* TAB NAVIGATION */}
       <div className="border-b border-white/5 px-8 flex items-center gap-8">
          {['Operations', 'Simulation', 'Audit', 'Contract'].map(tab => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${
                    activeTab === tab 
                        ? 'text-white border-amber-500' 
                        : 'text-gray-600 border-transparent hover:text-gray-400'
                }`}
             >
                {tab}
             </button>
          ))}
       </div>

       {/* BODY */}
       <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar bg-[#050505]">
          
          {activeTab === 'Operations' && (
             <div className="space-y-12 animate-fade-in-up">
                
                {/* Status Cards (Grid 1) */}
                <div className="grid grid-cols-3 w-full max-w-4xl">
                   <StatusCard 
                        label="Execution Velocity" 
                        value="Stable Cadence" 
                        icon={Activity} 
                        subtext="Within safety parameters" 
                   />
                   <StatusCard 
                        label="Focus Area" 
                        value="Integrity & Spam" 
                        icon={Shield} 
                        subtext="High confidence pattern matching" 
                   />
                   <StatusCard 
                        label="Agent State" 
                        value="Monitoring" 
                        icon={Eye} 
                        subtext="Shadow mode active" 
                   />
                </div>

                {/* Narrative / Log (Non-numeric) */}
                <div className="max-w-2xl">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">System Narrative</h3>
                    <div className="font-mono text-xs space-y-4 text-gray-400 border-l border-white/10 pl-4">
                        <div className="flex gap-4">
                            <span className="text-gray-600">10:42:01</span>
                            <span>System initialized in Shadow Mode.</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-600">10:43:15</span>
                            <span>Pattern drift detection active. No anomalies found.</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-600">10:45:00</span>
                            <span className="text-gray-300">Routine integrity scan completed.</span>
                        </div>
                        <div className="flex gap-4 opacity-50">
                            <span className="text-gray-600">10:46:22</span>
                            <span>Heartbeat sync... OK.</span>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'Simulation' && (
             <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Server size={16} /></div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Simulation Lab</h3>
                            <p className="text-[10px] text-gray-500">Real-time diff of Human vs Agent intent</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/5 text-[9px] text-gray-400">
                            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-50"></span> Human
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/5 text-[9px] text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full border border-blue-500"></span> Agent
                        </span>
                    </div>
                </div>

                <div className="border border-white/5 rounded-lg overflow-hidden bg-[#0A0A0A]">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-white/5 border-b border-white/5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        <div className="col-span-6">Context</div>
                        <div className="col-span-2">Reality</div>
                        <div className="col-span-2">Hypothesis</div>
                        <div className="col-span-2 text-right">Status</div>
                    </div>
                    {sims.map(sim => (
                        <SimulationRow key={sim.id} sim={sim} />
                    ))}
                </div>
             </div>
          )}

          {activeTab === 'Audit' && (
             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 animate-fade-in-up">
                <Fingerprint size={48} className="mb-4 opacity-20" />
                <h3 className="text-sm font-bold text-white mb-1">Ledger Immutable</h3>
                <p className="text-xs max-w-xs">
                   All sovereign decisions are cryptographically signed and stored in the read-only audit chain.
                </p>
             </div>
          )}

          {activeTab === 'Contract' && (
             <div className="max-w-2xl mx-auto border border-white/10 p-12 rounded-none bg-[#0c0c0c] shadow-2xl animate-fade-in-up relative">
                {/* Paper texture overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
                
                <div className="text-center mb-12 relative z-10">
                   <FileText size={32} className="mx-auto text-amber-900/50 mb-6" />
                   <h3 className="text-2xl font-serif text-white tracking-tight">Sovereign Authority Grant</h3>
                   <p className="text-xs text-gray-500 font-mono mt-2 uppercase tracking-widest">Protocol v0.1 • Shadow License</p>
                </div>
                
                <div className="prose prose-invert prose-sm mx-auto text-gray-400 leading-relaxed font-serif relative z-10">
                   <p>
                      By activating Sovereign Mode, the Operator (You) grants the Agent (System) the authority to execute moderation actions without prior human approval, within the bounds of the defined safety constraints.
                   </p>
                   <ul className="list-disc pl-4 space-y-2 mt-6">
                      <li>The Agent shall not permanently delete content.</li>
                      <li>The Agent shall not ban users.</li>
                      <li>Human restoration orders supersede Agent authority immediately.</li>
                   </ul>
                   
                   <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-end">
                      <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">Signed By</p>
                          <p className="font-serif text-xl text-white italic">Sarah Jenkins</p>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-2">Timestamp</p>
                          <p className="font-mono text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
             </div>
          )}

       </div>
    </motion.div>
  );
};

export default SovereignConsole;
