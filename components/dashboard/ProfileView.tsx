import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Zap, Shield, ChevronRight
} from 'lucide-react';
import PersonalizationStudio from '../profile/personalization/PersonalizationStudio';
import { dataService } from '../../services/dataService';
import { ProfileSpacesTab } from './ProfileSpacesTab';

type ProfileMode = 'Overview' | 'Spaces' | 'Activity' | 'Studio' | 'Wallet';

const ProfileView: React.FC = () => {
  const [mode, setMode] = useState<ProfileMode>('Overview');
  const user = dataService.getCurrentUser();

  if (!user) return <div className="text-white text-center py-20">Please log in to view profile.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white relative pb-32 selection:bg-purple-500/30">
       {/* Identity Strip */}
       <div className="h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/10 shadow-lg" alt="" />
             <div>
                <h1 className="text-sm font-bold flex items-center gap-1.5">{user.name} <ShieldCheck size={12} className="text-blue-500" /></h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Quantum Member</p>
             </div>
          </div>
          <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/5">
             {['Overview', 'Spaces', 'Activity', 'Studio', 'Wallet'].map(m => (
                <button key={m} onClick={() => setMode(m as any)} className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>{m}</button>
             ))}
          </div>
       </div>

       <main className="max-w-7xl mx-auto px-8 py-12">
          {mode === 'Overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                <div className="lg:col-span-8 space-y-8">
                   <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full" />
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10">Top Presence</h3>
                      <ProfileSpacesTab userId={user.id} />
                   </div>
                </div>
                
                <div className="lg:col-span-4 space-y-8">
                   <div className="p-8 rounded-[40px] bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                      <Zap size={24} className="text-yellow-400 mb-6 fill-yellow-400 group-hover:scale-110 transition-transform duration-700" />
                      <h3 className="text-2xl font-bold mb-3 tracking-tight">Social Authority</h3>
                      <p className="text-sm text-purple-200/60 leading-relaxed mb-10 font-light">Your protocol standing is establishing deep trust across multiple local communities.</p>
                      <button className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95">Generate Proof</button>
                   </div>
                </div>
             </div>
          )}

          {mode === 'Spaces' && (
             <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter mb-8">Community Standings</h2>
                <ProfileSpacesTab userId={user.id} />
             </div>
          )}

          {mode === 'Studio' && <PersonalizationStudio userId={user.id} />}
          
          {(mode === 'Activity' || mode === 'Wallet') && (
             <div className="py-40 text-center flex flex-col items-center opacity-30">
                <Activity size={64} className="text-gray-700 mb-6" />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">{mode} Syncing</h3>
                <p className="text-sm mt-2">Connecting to protocol shards...</p>
             </div>
          )}
       </main>
    </div>
  );
};

export default ProfileView;