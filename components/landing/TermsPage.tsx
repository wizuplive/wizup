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

const TermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/20 font-sans pt-32 pb-40 px-8">
      <div className="max-w-[660px] mx-auto space-y-24">
        
        <nav className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.5em] text-white uppercase">WIZUP</span>
          <button onClick={onBack} className="text-sm text-white/40 hover:text-white transition-colors">← Back</button>
        </nav>

        <header className="space-y-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Terms</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-white/40 font-light italic">Clear Expectations</p>
          <div className="pt-4 text-[10px] text-white/20 uppercase tracking-widest">Effective Date: August 12, 2025</div>
        </header>

        <article className="space-y-16">
          <p className="text-lg text-white/80 font-light leading-relaxed">
            WIZUP is a platform for creators and communities to engage intentionally and earn recognition through participation.
          </p>

          <LegalSection title="Eligibility">
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be 13 or older</li>
              <li>Users under 18 require parental consent</li>
            </ul>
          </LegalSection>

          <LegalSection title="YouTube Integration">
            <p>WIZUP uses read-only access to verify engagement.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not post, edit, or delete content</li>
              <li>We comply fully with Google and YouTube policies</li>
            </ul>
          </LegalSection>

          <LegalSection title="Rewards">
            <p>ZAPs Energy reflects participation and engagement.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>It unlocks features and experiences</li>
              <li>It has no inherent monetary value unless explicitly stated</li>
            </ul>
          </LegalSection>

          <LegalSection title="Responsible Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use bots or automation</li>
              <li>Exploit or manipulate systems</li>
              <li>Post harmful or illegal content</li>
            </ul>
            <p className="pt-2 text-white/30 italic">Violations may result in suspension or termination.</p>
          </LegalSection>

          <LegalSection title="Account Termination">
            <p>WIZUP may suspend or terminate accounts that violate these terms, the privacy policy, or applicable laws. Termination may result in loss of accumulated rewards.</p>
          </LegalSection>

          <LegalSection title="Disclaimer">
            <p>WIZUP is provided “as is.” We do not guarantee uninterrupted service or external availability.</p>
          </LegalSection>

          <section className="pt-24 border-t border-white/5 text-center space-y-8">
            <div className="space-y-2">
               <p className="text-sm font-medium text-white">Contact</p>
               <a href="mailto:wizuplive@gmail.com" className="text-sm text-white/40 hover:text-white transition-all">wizuplive@gmail.com</a>
            </div>
            <p className="text-[10px] text-white/10 uppercase tracking-[0.2em]">By using WIZUP, you agree to these terms.</p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default TermsPage;