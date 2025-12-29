import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Column: Text */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
              About WIZUP
            </h2>
            <p className="text-xl font-light text-gray-400 leading-relaxed max-w-lg">
              We've stripped away the noise to build a platform where value flows freely. 
              WIZUP isn't just a hosting tool; it's an ecosystem where creators, learners, 
              and brands converge. Experience a seamless blend of community management 
              and real-world utility, powered by intelligent design.
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-purple-500 to-transparent"></div>
          </div>

          {/* Right Column: Video/Cinematic Frame */}
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/wizup-interface/800/450" 
                alt="Platform Interface" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                   <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-gray-500 tracking-wide">The WIZUP Ecosystem Experience</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;