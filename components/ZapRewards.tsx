import React from 'react';
import { Gift, Video, UserCheck, Calendar, ShieldCheck, Box } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, colorClass }: { icon: any, title: string, colorClass: string }) => (
  <div className={`p-6 rounded-2xl bg-gradient-to-br ${colorClass} border border-white/5 hover:border-white/20 transition-all duration-300 group cursor-default`}>
    <Icon className="text-white/80 mb-3 group-hover:scale-110 transition-transform duration-300" size={28} strokeWidth={1.5} />
    <h3 className="text-lg font-medium text-white/90">{title}</h3>
  </div>
);

const ZapRewards: React.FC = () => {
  return (
    <section className="py-24 bg-[#050505]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
          <span className="text-gradient-purple">ZAP Rewards.</span> Value Realized.
        </h2>
        
        <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto mb-16">
          Your participation has value — real value. ZAPs unlock courses, communities, coaching, 
          events, and exclusive drops simply by showing up.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FeatureCard icon={Video} title="Premium Courses" colorClass="from-indigo-900/40 to-purple-900/10" />
          <FeatureCard icon={UserCheck} title="Creator Communities" colorClass="from-purple-900/40 to-pink-900/10" />
          <FeatureCard icon={Calendar} title="Live Coaching" colorClass="from-pink-900/40 to-rose-900/10" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard icon={Box} title="Exclusive Drops" colorClass="from-indigo-900/40 to-cyan-900/10" />
          <FeatureCard icon={ShieldCheck} title="Unlockable Events" colorClass="from-cyan-900/40 to-teal-900/10" />
          <FeatureCard icon={Gift} title="Collectible Rewards" colorClass="from-teal-900/40 to-emerald-900/10" />
        </div>

      </div>
    </section>
  );
};

export default ZapRewards;