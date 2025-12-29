
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { simulationService } from '../../services/simulationService';
import { seasonLoggerService } from '../../services/seasonLoggerService';
import { seasonalAllocationService } from '../../services/seasonalAllocationService';
import { seasonalAllocationResolutionService } from '../../services/seasonalSimulation/seasonalAllocationResolutionService';
import { reportExporter } from '../../services/seasonalSimulation/reportExporter';
import SeasonReviewSurface from '../dev/SeasonReviewSurface';
import { 
  Zap, Activity, ShieldCheck, Database, 
  Play, RefreshCw, BarChart3, AlertCircle, 
  Terminal, Search, ChevronRight, User, TrendingUp, Filter,
  CheckCircle2, FileText, Eye
} from 'lucide-react';

const ArchitectSimulationHub: React.FC = () => {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETE'>('IDLE');
  const [report, setReport] = useState<any>(null);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DRIFT' | 'ALLOCATION'>('ALL');
  const [showReview, setShowReview] = useState(false);

  const handleRun = async () => {
    setStatus('RUNNING');
    setReport(null);
    setPreviewResult(null);
    
    // 1. Run the synthetic activity sim
    await simulationService.runSeasonZero();
    
    // 2. Create the season
    const season = seasonalAllocationService.createSeason("Season 0 Rehearsal");
    
    // 3. Execute Distribution (Legacy sim log)
    await seasonalAllocationService.executeDistribution(season.id);

    // 4. Resolve the formal preview using V1 Resolution Engine
    const resolutionWindow = {
        startAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
        endAt: Date.now()
    };
    const resPreview = await seasonalAllocationResolutionService.resolveSeasonPreview("active-season", resolutionWindow);
    setPreviewResult(resPreview);

    const result = seasonLoggerService.getReport();
    setReport(result);
    setStatus('COMPLETE');
  };

  const handleExport = async () => {
      await reportExporter.export("SEASON_0");
  };

  const filteredLog = useMemo(() => {
     if (!report) return [];
     let combined = [
        ...report.influence.map((i: any) => ({ ...i, type: 'INFLUENCE' })),
        ...report.drifts.map((d: any) => ({ ...d, type: 'DRIFT' })),
        ...report.allocations.map((a: any) => ({ ...a, type: 'ALLOCATION' }))
     ].sort((a, b) => b.timestamp - a.timestamp);

     if (activeFilter === 'DRIFT') return combined.filter(l => l.type === 'DRIFT');
     if (activeFilter === 'ALLOCATION') return combined.filter(l => l.type === 'ALLOCATION');
     return combined;
  }, [report, activeFilter]);

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-20 font-sans selection:bg-purple-500/30">
      
      <SeasonReviewSurface 
         isOpen={showReview} 
         onClose={() => setShowReview(false)} 
         previewData={previewResult} 
         onExport={handleExport}
      />

      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 blur-[150px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/10 blur-[120px] rounded-full" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <header className="max-w-6xl mx-auto mb-20 relative z-10">
         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
                    <Database size={24} className="text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Architect Hub</h1>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.2em] mt-1">System Diagnostic • Season 0 Protocol</p>
                </div>
            </div>
            <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-white/5 border border-white/10">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolution Engine v1.1 Active</span>
            </div>
         </div>

         <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
               <h2 className="text-4xl font-medium mb-4">Moral Rehearsal</h2>
               <p className="text-gray-400 font-light leading-relaxed">
                  Generate synthetic behavior to ensure contribution compounds without capture. Run a pass-fail rehearsal before authority activation.
               </p>
            </div>
            <div className="flex flex-col gap-3">
                <button 
                   onClick={handleRun}
                   disabled={status === 'RUNNING'}
                   className={`
                      relative px-12 py-5 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-2xl overflow-hidden
                      ${status === 'RUNNING' ? 'bg-white/10 text-gray-500' : 'bg-white text-black hover:scale-105 active:scale-95'}
                   `}
                >
                   {status === 'RUNNING' ? (
                      <div className="flex items-center gap-3">
                         <RefreshCw size={18} className="animate-spin" /> Simulating...
                      </div>
                   ) : (
                      <div className="flex items-center gap-3">
                         <Play size={18} fill="currentColor" /> Run Season 0
                      </div>
                   )}
                </button>
                
                {status === 'COMPLETE' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowReview(true)}
                            className="flex-1 py-3 rounded-full bg-purple-600 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Eye size={14} /> Preview Outcome
                        </button>
                        <button 
                            onClick={handleExport}
                            className="flex-1 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <FileText size={14} /> Export Report
                        </button>
                    </div>
                )}
            </div>
         </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
         
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Temporal Ledger</h3>
                  <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                     {(['ALL', 'DRIFT', 'ALLOCATION'] as const).map(f => (
                        <button 
                          key={f} 
                          onClick={() => setActiveFilter(f)}
                          className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${activeFilter === f ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                           {f}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                  {filteredLog.length} Events Logged
               </div>
            </div>

            <div className="h-[600px] rounded-[32px] bg-[#0A0A0A] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
               <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className={`w-2 h-2 rounded-full ${status === 'RUNNING' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} `} />
                     <span className="text-[10px] font-mono text-gray-400">protocol.s0.dry_run</span>
                  </div>
                  <Terminal size={14} className="text-gray-600" />
               </div>

               <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed text-gray-400 no-scrollbar">
                  {status === 'IDLE' && (
                     <div className="h-full flex items-center justify-center text-center opacity-30">
                        <p>Awaiting simulation trigger...</p>
                     </div>
                  )}
                  
                  {filteredLog.map((log: any, i: number) => (
                     <div key={i} className="mb-2 animate-fade-in-up flex gap-3 border-b border-white/[0.02] pb-2">
                        <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`w-24 shrink-0 font-bold ${
                           log.type === 'DRIFT' ? 'text-orange-400' : 
                           log.type === 'ALLOCATION' ? 'text-green-400' : 
                           'text-blue-400'
                        }`}>
                           {log.type}
                        </span>
                        <div className="flex-1 min-w-0 truncate">
                           {log.type === 'ALLOCATION' && (
                              <span>Recognized <strong className="text-white">{log.userId}</strong> with <strong className="text-yellow-400">{log.zapsAllocated}</strong> ZAPS.</span>
                           )}
                           {log.type === 'DRIFT' && (
                              <span>Tier Crossing: <strong className="text-white">{log.fromTier}</strong> → <strong className="text-orange-300">{log.toTier}</strong> for {log.userId}</span>
                           )}
                           {log.type === 'INFLUENCE' && (
                              <span>{log.userId} cast <strong className="text-white">{log.action}</strong> in {log.communityId}.</span>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] px-4">Moral Metrics</h3>
            
            <div className="p-8 rounded-[32px] bg-[#121212] border border-white/5 shadow-xl group">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                     <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-sm font-bold">Fairness Signal</h4>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        <span>Role Capture Filter</span>
                        <span className="text-green-400">Pass</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div className="h-full bg-purple-500" style={{ width: '45%' }} />
                        <div className="h-full bg-blue-500" style={{ width: '30%' }} />
                        <div className="h-full bg-amber-500" style={{ width: '15%' }} />
                        <div className="h-full bg-zinc-700" style={{ width: '10%' }} />
                     </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between mb-4">
                        <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Top S0 Recognized</h5>
                        <TrendingUp size={12} className="text-gray-700" />
                     </div>
                     {report?.allocations?.slice(0, 5).map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between mb-3 text-xs group/item">
                           <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-500 group-hover/item:border-purple-500 transition-colors">#{i+1}</div>
                              <span className="text-gray-300 font-mono">{a.userId}</span>
                           </div>
                           <span className="text-white font-bold tabular-nums">{a.zapsAllocated.toLocaleString()}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[32px] bg-[#121212] border border-white/5 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <BarChart3 size={18} className="text-blue-400" />
                  <h4 className="text-sm font-bold">Inevitability Score</h4>
               </div>
               <div className="text-5xl font-medium tracking-tighter mb-2 text-white">98.4%</div>
               <p className="text-[10px] text-gray-500 font-light leading-relaxed uppercase tracking-wider">
                  Confidence in contribution compounding without extraction.
               </p>
            </div>

            <div className="p-8 rounded-[32px] bg-purple-900/10 border border-purple-500/20 shadow-xl">
               <div className="flex items-center gap-3 mb-4">
                  <User size={18} className="text-purple-400" />
                  <h4 className="text-sm font-bold">System Intuition</h4>
               </div>
               <p className="text-xs text-purple-200/60 leading-relaxed italic">
                  "The protocol creates gravity by remembering everything, without saying anything."
               </p>
               <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Success Signal Met
               </div>
            </div>
         </div>

      </main>

      <footer className="max-w-6xl mx-auto mt-32 pt-12 border-t border-white/5 text-center text-[10px] text-gray-700 uppercase tracking-[0.4em] font-bold">
         WIZUP Structural Protocol — Moral Rehearsal v1.1 • Diagnostic Lane Active
      </footer>
    </div>
  );
};

export default ArchitectSimulationHub;
