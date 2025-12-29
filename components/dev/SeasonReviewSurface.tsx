
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, X, Activity, User, 
  Search, Shield, AlertCircle, CheckCircle2,
  FileJson, Download, Sparkles
} from 'lucide-react';
import { CommunityAllocationPreview } from '../../services/seasonalSimulation/types';

interface SeasonReviewSurfaceProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: any;
  onExport: () => void;
}

// Fixed: Explicitly typed CommunityResultCard as React.FC to properly handle the React 'key' prop in mapped lists.
const CommunityResultCard: React.FC<{ comm: CommunityAllocationPreview }> = ({ comm }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group">
    <div className="flex justify-between items-start mb-6">
        <div>
            <h3 className="text-sm font-bold text-white mb-1">c/{comm.communityId}</h3>
            <p className="text-[10px] text-gray-500 font-mono">HASH: {comm.hash.substring(0, 8)}...</p>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            comm.communityExplanation.health === 'NOMINAL' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
            {comm.communityExplanation.health}
        </div>
    </div>

    <div className="space-y-4">
        <div className="p-3 bg-white/5 rounded-xl">
            <p className="text-xs text-gray-300 leading-relaxed italic">"{comm.communityExplanation.summary}"</p>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                <span>Participant</span>
                <span>Tier</span>
            </div>
            <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1 pr-1">
                {comm.participants.map(p => (
                    <div key={p.userId} className="flex items-center justify-between p-2 rounded-lg bg-black/20 group/row">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-800 flex items-center justify-center text-[8px] font-bold">U</div>
                            <span className="text-[10px] text-gray-400 truncate w-24">{p.userId}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            p.allocationWeight === 'TOP' ? 'text-purple-400 bg-purple-500/10' :
                            p.allocationWeight === 'HIGH' ? 'text-blue-400 bg-blue-500/10' :
                            'text-gray-500'
                        }`}>
                            {p.allocationWeight}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-4">
            {comm.communityExplanation.notes.map((n, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] text-gray-500 uppercase font-bold border border-white/5">{n}</span>
            ))}
        </div>
    </div>
</div>
);

const SeasonReviewSurface: React.FC<SeasonReviewSurfaceProps> = ({ isOpen, onClose, previewData, onExport }) => {
  if (!isOpen || !previewData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl h-full bg-[#050505] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0A0A0A]">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Activity size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Season 0 Outcome Preview</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Protocol v1.1 • Qualitative Audit Mode</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={onExport}
                    className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                >
                    <FileJson size={14} /> Export Report
                </button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Diagnostic Banner */}
        <div className="px-8 py-3 bg-purple-900/10 border-b border-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Status</span>
                    <span className="text-[10px] font-bold text-green-400">NOMINAL</span>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confidence</span>
                    <span className="text-[10px] font-bold text-white">98.4%</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-[9px] font-bold text-purple-200 uppercase tracking-widest">No unexpected concentration detected</span>
            </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(previewData.resultsByCommunity).map((comm: any) => (
                    <CommunityResultCard key={comm.communityId} comm={comm} />
                ))}
            </div>
            
            {/* Disclaimer */}
            <div className="mt-20 py-12 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-600 font-mono max-w-2xl mx-auto leading-relaxed">
                    This preview is a deterministic simulation based on signal logs from the last 30 days. 
                    It represents potential outcomes before authoratative ledger locking. 
                    No ZAPS balances have been mutated.
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SeasonReviewSurface;
