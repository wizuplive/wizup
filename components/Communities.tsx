
import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Community } from '../types';

const MOCK_COMMUNITIES: Community[] = [
  { id: 1, name: "Design Systems Mastery", creator: "Sarah J.", members: "12k", category: "Design", image: "https://picsum.photos/seed/design/400/300" },
  { id: 2, name: "Crypto Insiders", creator: "Alex Chain", members: "8.5k", category: "Finance", image: "https://picsum.photos/seed/crypto/400/300" },
  { id: 3, name: "Mindful Living", creator: "Zen Space", members: "22k", category: "Wellness", image: "https://picsum.photos/seed/zen/400/300" },
];

const Communities: React.FC = () => {
  return (
    <section id="community" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex justify-between items-end mb-12">
           <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Popular Communities</h2>
              <p className="text-gray-400">Join thousands of creators building the future.</p>
           </div>
           <button className="hidden md:flex items-center gap-2 text-white hover:text-purple-400 transition-colors font-medium">
              View All <ArrowRight size={16} />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {MOCK_COMMUNITIES.map((item) => (
              <div key={item.id} className="group bg-[#121212] rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 cursor-pointer">
                 <div className="h-48 overflow-hidden relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                       {item.category}
                    </div>
                 </div>
                 <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                       <span>by {item.creator}</span>
                       <span className="flex items-center gap-1"><Users size={14} /> {item.members}</span>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        <div className="mt-8 text-center md:hidden">
           <button className="text-white font-medium hover:text-purple-400 transition-colors">View All Communities</button>
        </div>

      </div>
    </section>
  );
};

export default Communities;
