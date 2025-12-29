import React from 'react';

// fix: Made children optional to satisfy strict TS check on JSX attributes
const LegalSection = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-medium text-white tracking-tight">{title}</h3>
    <div className="text-white/60 leading-relaxed text-sm space-y-4">
      {children}
    </div>
  </div>
);

const SafetyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/20 font-sans pt-32 pb-40 px-8">
      <div className="max-w-[660px] mx-auto space-y-24">
        
        <nav className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.5em] text-white uppercase">WIZUP</span>
          <button onClick={onBack} className="text-sm text-white/40 hover:text-white transition-colors">← Back</button>
        </nav>

        <header className="space-y-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Safety</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Safety</h1>
          <p className="text-white/40 font-light italic">Designed for Presence, Not Harm</p>
        </header>

        <article className="space-y-16">
          <p className="text-lg text-white/80 font-light leading-relaxed">
            WIZUP is built to support respectful, focused, and intentional participation.
          </p>

          <LegalSection title="What We Expect">
            <ul className="list-disc pl-5 space-y-2">
              <li>Treat others with respect</li>
              <li>Participate in good faith</li>
              <li>Protect the integrity of shared spaces</li>
            </ul>
          </LegalSection>

          <LegalSection title="What’s Not Allowed">
            <ul className="list-disc pl-5 space-y-2">
              <li>Harassment or abuse</li>
              <li>Manipulation or exploitation</li>
              <li>Harmful, illegal, or deceptive activity</li>
            </ul>
          </LegalSection>

          <LegalSection title="Enforcement">
            <p>We may remove content, restrict access, or suspend/terminate accounts. All actions are taken to protect the community.</p>
          </LegalSection>

          <LegalSection title="Reporting">
            <p>If something doesn’t feel right, reach out.</p>
            <div className="pt-4 flex flex-col gap-2">
               <a href="mailto:wizuplive@gmail.com" className="text-sm text-white font-medium hover:underline">wizuplive@gmail.com</a>
            </div>
          </LegalSection>

          <section className="pt-24 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] font-bold">&copy; 2025 WIZUP • Designed for Belonging</p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default SafetyPage;