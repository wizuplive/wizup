import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, FileJson, Download, 
  Shield, Database, AlertCircle, ChevronDown, 
  ChevronRight, Hash, Eye, EyeOff
} from 'lucide-react';
import { seasonReportService, Season0ReportArtifact } from '../../services/seasonalSimulation/seasonReportService';
import { seasonalAllocationSimulation } from '../../services/seasonalSimulation/seasonalAllocationSimulation';

export default function SeasonClosePreviewPanel() {
  const [report, setReport] = useState<Season0ReportArtifact | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [expandedComm, setExpandedComm] = useState<string | null>(null);

  const handleClose = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('dev');
    window.location.href = url.toString();
  };

  const handleRecompute = async () => {
    setLoading(true);
    try {
      await seasonalAllocationSimulation.recomputeSeason("season0");
      const newReport = await seasonReportService.buildSeason0Report();
      setReport(newReport);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    await seasonReportService.downloadSeason0Report();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/20">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Season 0 Close Preview</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Internal Simulation Environment</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRecompute}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Recompute
          </button>
          <button 
            onClick={handleDownload}
            disabled={!report || loading}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Download size={14} />
            Download JSON
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          {!report && !loading ? (
            <div className="py-40 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <AlertCircle size={32} className="text-zinc-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-400">No Simulation Data</h2>
              <p className="text-sm text-zinc-600 max-w-xs mt-2">Trigger a recompute to generate the Season 0 report artifact.</p>
            </div>
          ) : loading ? (
            <div className="py-40 text-center flex flex-col items-center">
               <RefreshCw size={48} className="animate-spin text-purple-500 mb-6" />
               <h2 className="text-lg font-bold text-zinc-300">Resolving Entitlements...</h2>
               <p className="text-sm text-zinc-500 mt-2">Aggregating signal logs and applying normalization curves.</p>
            </div>
          ) : (
            <div className="animate-fade-in-up space-y-10">
              {/* Report Header Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Global Report Hash</span>
                   <div className="flex items-center gap-2">
                      <Hash size={12} className="text-zinc-700" />
                      <span className="text-xs font-mono text-zinc-300 truncate">{report.globalSummary.reportHash}</span>
                   </div>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Eligible Entities</span>
                   <span className="text-2xl font-bold text-white">{report.globalSummary.totalEligibleUsers}</span>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Deterministic Status</span>
                   <span className="text-xs font-bold text-green-400 flex items-center gap-1.5 mt-2">
                      <Shield size={12} /> VERIFIED
                   </span>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex justify-end">
                 <button 
                  onClick={() => setShowNumbers(!showNumbers)}
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2 transition-colors"
                 >
                    {showNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showNumbers ? 'Hide Dev Details' : 'Reveal Raw Scores'}
                 </button>
              </div>

              {/* Communities List */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2">Community Shards</h3>
                {/* fix: added explicit type casting to Object.entries to resolve 'unknown' property access errors */}
                {(Object.entries(report.perCommunity) as [string, Season0ReportArtifact['perCommunity'][string]][]).map(([id, data]) => (
                  <div key={id} className="rounded-3xl bg-zinc-900/30 border border-white/5 overflow-hidden">
                    <button 
                      onClick={() => setExpandedComm(expandedComm === id ? null : id)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${data.whaleClampHits > 0 ? 'bg-amber-500' : 'bg-green-500'}`} />
                        <span className="font-bold text-zinc-200">c/{id}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">HASH: {data.hash.substring(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xs font-bold text-zinc-400 block">{data.eligibleCount}</span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Eligible</span>
                        </div>
                        {expandedComm === id ? <ChevronDown size={16} className="text-zinc-600" /> : <ChevronRight size={16} className="text-zinc-600" />}
                      </div>
                    </button>
                    
                    {expandedComm === id && (
                      <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/20 animate-slide-up-fade">
                        <div className="grid grid-cols-2 gap-8 mt-4">
                           <div>
                              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">Stewardship Narrative</span>
                              <p className="text-sm text-zinc-300 italic leading-relaxed">"{data.stewardshipNarrative}"</p>
                              
                              <div className="mt-6 flex gap-4">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-zinc-600 font-bold uppercase">Whale Clamps</span>
                                    <span className={`text-xs font-bold ${data.whaleClampHits > 0 ? 'text-amber-500' : 'text-zinc-400'}`}>{data.whaleClampHits} Hits</span>
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-zinc-600 font-bold uppercase">Volume Dampening</span>
                                    <span className={`text-xs font-bold ${data.capHits > 0 ? 'text-purple-400' : 'text-zinc-400'}`}>{data.capHits} Hits</span>
                                 </div>
                              </div>
                           </div>
                           <div>
                              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">Top 5 Contributors</span>
                              <div className="space-y-2">
                                 {data.topContributors.map(c => (
                                    <div key={c.userId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5">
                                       <span className="text-zinc-400 font-mono truncate w-24">{c.userId}</span>
                                       <div className="flex items-center gap-3">
                                          <span className="text-[10px] text-zinc-600 font-bold uppercase">{c.band}</span>
                                          <span className="px-1.5 py-0.5 rounded-md bg-purple-600/20 text-purple-300 font-bold text-[9px]">{c.tier}</span>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {showNumbers && (
                           <div className="mt-8 pt-6 border-t border-white/10">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
                                 <AlertCircle size={10} /> Raw Resolution Metrics (Internal Only)
                              </span>
                              <pre className="text-[10px] font-mono text-zinc-600 bg-black/40 p-4 rounded-xl overflow-x-auto">
                                 {JSON.stringify(data.internalMetrics, null, 2)}
                              </pre>
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {/* Params Snapshot */}
              <section className="pt-10 border-t border-white/5">
                 <div className="flex items-center gap-3 mb-6">
                    <Shield size={16} className="text-zinc-500" />
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Locked Calibration v1.1</h3>
                 </div>
                 <div className="p-6 rounded-3xl bg-zinc-900/20 border border-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       {Object.entries(report.parametersSnapshot.data.weights).slice(0, 4).map(([key, val]) => (
                          <div key={key}>
                             <span className="text-[9px] text-zinc-600 font-bold uppercase block mb-1">{key}</span>
                             <span className="text-sm font-mono text-zinc-300">{val as any}</span>
                          </div>
                       ))}
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                       <p className="text-[10px] text-zinc-600 font-light italic">All weights and dampening curves are immutable for the duration of Season 0.</p>
                       <div className="text-[9px] font-mono text-zinc-700">SHA-256: {report.parametersSnapshot.hash.substring(0, 16)}...</div>
                    </div>
                 </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Footer Status */}
      <footer className="h-10 border-t border-white/10 px-8 flex items-center justify-between bg-black text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800">
         <span>WIZUP Architect Protocol 7.0</span>
         <span>Identity Persists • Truth Synthesized</span>
      </footer>
    </div>
  );
}