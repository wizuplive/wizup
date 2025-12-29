
import React from 'react';
import { Users, Zap, Shield, Globe, CreditCard, Cpu } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 rounded-3xl bg-[#121212] border border-white/5 hover:border-white/10 transition-colors group">
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
       <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need.</h2>
           <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Powerful tools to help you build a sustainable business around your passion.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <FeatureCard 
             icon={Users} 
             title="Community Spaces" 
             desc="Create dedicated channels for discussions, events, and resources." 
           />
           <FeatureCard 
             icon={CreditCard} 
             title="Monetization" 
             desc="Sell courses, memberships, and digital products with zero friction." 
           />
           <FeatureCard 
             icon={Zap} 
             title="ZAP Rewards" 
             desc="Incentivize engagement with our built-in gamification system." 
           />
           <FeatureCard 
             icon={Shield} 
             title="Private & Secure" 
             desc="You own your data. End-to-end security for your members." 
           />
           <FeatureCard 
             icon={Cpu} 
             title="AI Powered" 
             desc="Use Gemini tools to generate content, assets, and copy instantly." 
           />
           <FeatureCard 
             icon={Globe} 
             title="Custom Branding" 
             desc="Make it yours. Customize your domain, colors, and identity." 
           />
        </div>

      </div>
    </section>
  );
};

export default Features;
