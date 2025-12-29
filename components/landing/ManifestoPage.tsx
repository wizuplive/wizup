import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ title, paragraphs }: { title?: string; paragraphs: string[] }) => (
  <motion.div 
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
    className="space-y-12 md:space-y-16"
  >
    {title && (
      <h3 className="text-3xl md:text-5xl font-light text-white tracking-tight leading-tight">
        {title}
      </h3>
    )}
    <div className="space-y-8 md:space-y-10">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-lg md:text-xl text-white/70 font-light leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  </motion.div>
);

const ManifestoPage: React.FC<{ onEnter: () => void; onExplore: () => void }> = ({ onEnter, onExplore }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/20">
      {/* Editorial Container */}
      <article className="max-w-2xl md:max-w-3xl mx-auto px-8 pt-48 md:pt-64 pb-64 font-sans">
        
        {/* Opening Frame */}
        <header className="text-center mb-48 md:mb-64">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 3 }}
            className="text-[10px] md:text-[12px] font-black uppercase tracking-[1em] mb-12"
          >
            The Wizup Manifesto
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-7xl font-bold tracking-tighter leading-[0.9]"
          >
            Home, by design.
          </motion.h2>
        </header>

        {/* Content Flow */}
        <div className="space-y-32 md:space-y-48">
          
          <Section 
            paragraphs={[
              "The internet was built to move fast. People weren’t.",
              "Somewhere along the way, places became feeds. Conversations became noise. Presence became optional.",
              "WIZUP exists to restore what mattered before scale replaced care.",
              "Not more content. Not more reach. But places people choose to return to."
            ]}
          />

          <Section 
            title="Places people show up."
            paragraphs={[
              "A community isn’t a timeline. It isn’t an audience. It isn’t a moment.",
              "A real community is a place where people recognize each other. Where ideas don’t disappear. Where time adds meaning instead of erasing it.",
              "WIZUP is built for that kind of place.",
              "Spaces designed for focus. For learning. For collaboration. For belonging.",
              "Places that hold attention—not harvest it."
            ]}
          />

          <Section 
            title="Built for presence, not noise."
            paragraphs={[
              "We believe presence is a choice. And good design should make that choice easier.",
              "Every Space on WIZUP is intentional by default. No infinite scroll. No algorithmic pressure. No performance theater.",
              "Just people, ideas, and time—working together."
            ]}
          />

          <Section 
            title="When something matters, it deserves to stay."
            paragraphs={[
              "What you build should last.",
              "On most platforms, work fades. Posts sink. Conversations vanish.",
              "Here, memory is structural. Ideas persist. Relationships compound. History remains accessible—not buried.",
              "What you contribute becomes part of the Space itself. Not a moment. Not a metric. A foundation."
            ]}
          />

          <Section 
            title="Energy flows where meaning lives."
            paragraphs={[
              "Every community runs on energy—attention, care, contribution.",
              "On WIZUP, that energy is visible. ZAPs Energy is how participation is felt. It reflects presence. It rewards contribution. It strengthens connection.",
              "Not as a score. Not as a game. But as a quiet signal of engagement, trust, and momentum.",
              "Energy moves through people who show up. And places that respect them."
            ]}
          />

          <Section 
            title="Privacy is not a feature. It’s the default."
            paragraphs={[
              "Communities need safety to grow. Trust to deepen. Silence to think.",
              "WIZUP does not trade attention for exposure. We do not sell distraction. We do not optimize for outrage.",
              "Spaces are protected. Participation is intentional. Control stays with the people inside.",
              "Because belonging cannot exist without boundaries."
            ]}
          />

          <Section 
            title="Designed to endure."
            paragraphs={[
              "We’re not building for trends. We’re building for time.",
              "For founders navigating real decisions. For creators shaping lasting work. For groups that want to stay connected beyond cycles.",
              "WIZUP is a home for communities that expect to be here tomorrow. And the day after that. And long after the noise has moved on."
            ]}
          />

          {/* Final Ending Moment */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.5 }}
            className="pt-32 md:pt-48 flex flex-col items-center text-center space-y-16"
          >
            <div className="space-y-8">
              <p className="text-2xl md:text-4xl font-medium tracking-tight text-white/90">
                Step inside.
              </p>
              <p className="text-sm md:text-base text-white/30 font-light max-w-sm mx-auto leading-relaxed">
                If you’re looking for reach, there are faster places. If you’re looking for a place to build something that matters— Welcome home.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <button 
                onClick={onEnter}
                className="px-12 py-5 rounded-full bg-white text-black font-bold text-[10px] tracking-[0.5em] uppercase transition-all duration-700 hover:scale-105 active:scale-95 shadow-2xl"
              >
                Enter WIZUP
              </button>
              <button 
                onClick={onExplore}
                className="px-10 py-5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 font-bold text-[10px] tracking-[0.5em] uppercase transition-all duration-700"
              >
                Explore Spaces
              </button>
            </div>

            <div className="pt-32 opacity-10">
               <div className="w-1 h-1 rounded-full bg-white mb-12 mx-auto shadow-[0_0_10px_white]" />
               <p className="text-[9px] font-black uppercase tracking-[0.8em]">Presence is Sovereignty.</p>
            </div>
          </motion.div>
        </div>
      </article>

      {/* Subtle Bottom Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[50vh] bg-[radial-gradient(circle_at_bottom,_rgba(168,85,247,0.03)_0%,_transparent_70%)] pointer-events-none" />
    </div>
  );
};

export default ManifestoPage;