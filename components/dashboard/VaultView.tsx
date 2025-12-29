import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, Hash, ArrowLeft, History, FileText, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { artifactIndexKey, artifactDocKey } from '../../services/zaps/season0/persistence/keys';

interface VaultViewProps {
  onBack: () => void;
}

const VaultView: React.FC<VaultViewProps> = ({ onBack }) => {
  const [index, setIndex] = useState<any[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<any | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(artifactIndexKey());
    if (raw) {
      try {
        setIndex(JSON.parse(raw));
      } catch (e) {
        console.error("Vault index corrupt");
      }
    }
  }, []);

  const loadArtifact = (entry: any) => {
    const key = artifactDocKey(entry.communityId, entry.seasonId);
    const raw = localStorage.getItem(key);
    if (raw) {
      setSelectedArtifact(JSON.parse(raw));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-20 animate-fade-in-up relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/5 blur-[150px] pointer-events-none" />

      <header className="max-w-6xl mx-auto mb-16 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                 Architect's Vault <span className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">Protocol Log</span>
              </h1>
              <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Immutable Simulation Records • v1.1</p>
           </div>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-green-500/5 border border-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest">
           <Shield size={12} /> Integrity: Verified
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
         
         {/* Index List */}
         <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] pl-2 mb-6">Simulation Index</h3>
            {index.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-3xl opacity-30">
                    <History size={32} className="mx-auto mb-4" />
                    <p className="text-xs">No simulation checkpoints found. Run a rehearsal in the Architect Hub.</p>
                </div>
            ) : (
                index.map((entry, idx) => (
                    <button 
                        key={idx}
                        onClick={() => loadArtifact(entry)}
                        className={`w-full text-left p-6 rounded-[28px] border transition-all duration-300 group ${
                            selectedArtifact?.hashes?.outputHash === entry.outputHash 
                                ? 'bg-white/10 border-white/20 shadow-2xl' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-mono text-purple-400">{entry.seasonId}</span>
                            <span className="text-[9px] text-gray-600 font-mono">#{entry.outputHash.substring(0, 6)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">c/{entry.communityId}</h4>
                        <p className="text-[10px] text-gray-500">{new Date(entry.writtenAtMs).toLocaleString()}</p>
                    </button>
                ))
            )}
         </div>

         {/* Detailed View */}
         <div className="lg:col-span-8">
            {selectedArtifact ? (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/[0.02] blur-[100px] rounded-full" />
                        
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h2 className="text-4xl font-medium tracking-tight mb-2">Simulation Artifact</h2>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                    <span>Community: {selectedArtifact.communityId}</span>
                                    <span>•</span>
                                    <span>Season: {selectedArtifact.seasonId}</span>
                                </div>
                            </div>
                            <CheckCircle2 className="text-green-500" size={32} />
                        </div>

                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Resolved Weights</h5>
                                <div className="space-y-2">
                                    {Object.entries(selectedArtifact.resolvedWeights).slice(0, 5).map(([user, weight]: any) => (
                                        <div key={user} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                            <span className="text-xs font-mono text-gray-400">{user.substring(0, 12)}...</span>
                                            <span className="text-xs font-bold text-purple-400">{(weight * 100).toFixed(2)}%</span>
                                        </div>
                                    ))}
                                    {Object.keys(selectedArtifact.resolvedWeights).length > 5 && (
                                        <p className="text-[10px] text-gray-600 text-center">+ {Object.keys(selectedArtifact.resolvedWeights).length - 5} more participants</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Artifact Hashes</h5>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[9px] text-gray-500 uppercase block mb-1">Input Hash</span>
                                        <div className="text-[10px] font-mono text-gray-400 break-all p-2 bg-black rounded border border-white/5">{selectedArtifact.hashes.inputHash}</div>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-gray-500 uppercase block mb-1">Logic Hash</span>
                                        <div className="text-[10px] font-mono text-gray-400 break-all p-2 bg-black rounded border border-white/5">{selectedArtifact.hashes.configHash}</div>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-gray-500 uppercase block mb-1">Output Hash</span>
                                        <div className="text-[10px] font-mono text-white break-all p-2 bg-black rounded border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">{selectedArtifact.hashes.outputHash}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedArtifact.notes && (
                            <div className="mt-12 pt-8 border-t border-white/5">
                                <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Architect Notes</h5>
                                <ul className="space-y-2">
                                    {selectedArtifact.notes.map((n: string, i: number) => (
                                        <li key={i} className="text-xs text-gray-400 font-light leading-relaxed flex gap-3">
                                            <span className="text-purple-500">•</span> {n}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        <Activity size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold">Selection Required</h3>
                    <p className="text-sm max-w-xs mx-auto mt-2">Choose an artifact from the temporal index to inspect the resolved recognition weights.</p>
                </div>
            )}
         </div>

      </main>

      <footer className="mt-32 pt-12 border-t border-white/5 text-center text-[10px] text-gray-700 uppercase tracking-[0.4em] font-bold">
         WIZUP Vault Protocol — Immutable Record State
      </footer>
    </div>
  );
};

export default VaultView;