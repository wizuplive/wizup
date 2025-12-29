import React from 'react';
import { UserPlus, Compass, TrendingUp } from 'lucide-react';

const StepCard = ({ number, icon: Icon, title, desc }: { number: string, icon: any, title: string, desc: string }) => (
  <div className="flex items-start gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-gray-300">
      <Icon size={20} strokeWidth={1.5} />
    </div>
    <div>
      <span className="text-xs font-bold text-gray-600 mb-1 block">STEP {number}</span>
      <h4 className="text-lg font-medium text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-400 font-light leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Process: React.FC = () => {
  return (
    <section className="py-32 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Left Headline */}
        <div className="flex flex-col justify-center">
          <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-6">
            How WIZUP<br />Works.
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-sm">
            Three simple steps to redefine your digital presence and value.
          </p>
        </div>

        {/* Right Steps */}
        <div className="space-y-6">
          <StepCard 
            number="01" 
            icon={UserPlus} 
            title="Create Profile" 
            desc="Join the ecosystem and set up your digital identity in seconds." 
          />
          <StepCard 
            number="02" 
            icon={Compass} 
            title="Discover & Join" 
            desc="Find communities that align with your passions and goals." 
          />
          <StepCard 
            number="03" 
            icon={TrendingUp} 
            title="Engage & Earn" 
            desc="Participate in events, complete challenges, and earn real value." 
          />
        </div>

      </div>
    </section>
  );
};

export default Process;