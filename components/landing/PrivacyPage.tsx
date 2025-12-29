import React from 'react';
import { motion } from 'framer-motion';

// fix: Made children optional to satisfy strict TS check on JSX attributes
const LegalSection = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-medium text-white tracking-tight">{title}</h3>
    <div className="text-white/60 leading-relaxed text-sm space-y-4">
      {children}
    </div>
  </div>
);

const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/20 font-sans pt-32 pb-40 px-8">
      <div className="max-w-[660px] mx-auto space-y-24">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.5em] text-white uppercase">WIZUP</span>
          <button onClick={onBack} className="text-sm text-white/40 hover:text-white transition-colors">← Back</button>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Privacy</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-white/40 font-light italic">Transparency & Trust</p>
          <div className="pt-4 text-[10px] text-white/20 uppercase tracking-widest">Effective Date: August 12, 2025</div>
        </header>

        {/* Content */}
        <article className="space-y-16">
          <p className="text-lg text-white/80 font-light leading-relaxed">
            WIZUP is built to respect privacy by default. We collect only what’s necessary to operate the platform — and nothing more.
          </p>

          <LegalSection title="Information We Collect">
            <div className="space-y-6">
              <div>
                <p className="font-medium text-white mb-2 underline decoration-white/10 underline-offset-4">Google Account Data (via OAuth)</p>
                <p>Used for authentication and engagement verification.</p>
                <ul className="list-disc pl-5 mt-3 space-y-2">
                  <li>Email address (account access only)</li>
                  <li>Read-only YouTube watch activity: We verify which videos are watched. We do not access likes, comments, uploads, messages, or subscribers.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-white mb-2 underline decoration-white/10 underline-offset-4">Platform Activity</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>ZAPs Energy transactions</li>
                  <li>Quest and engagement records</li>
                </ul>
              </div>
            </div>
          </LegalSection>

          <LegalSection title="How We Use Your Data">
            <p>We use your data only to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Verify engagement</li>
              <li>Complete quests</li>
              <li>Award ZAPs Energy</li>
              <li>Manage access and features</li>
            </ul>
            <p className="pt-4 text-white/30 italic">We do not advertise, profile users, or sell/share data.</p>
          </LegalSection>

          <LegalSection title="Data Storage & Retention">
            <ul className="list-disc pl-5 space-y-2">
              <li>Stored securely using Google Firebase</li>
              <li>Encrypted at rest and in transit</li>
              <li>Inactive accounts deleted after 12 months</li>
              <li>Deletion available anytime on request</li>
            </ul>
          </LegalSection>

          <LegalSection title="Security">
            <p>End-to-end encryption. Restricted internal access. Regular audits and safeguards.</p>
          </LegalSection>

          <LegalSection title="Third Parties">
            <p>Data is shared only with trusted infrastructure providers: Google Cloud / Firebase.</p>
            <p className="text-white/30 italic">No advertisers. No brokers.</p>
          </LegalSection>

          <LegalSection title="Your Rights">
            <p>You may revoke Google access at any time, request a copy of your data, or request deletion.</p>
          </LegalSection>

          <section className="pt-24 border-t border-white/5 text-center space-y-8">
            <div className="space-y-2">
               <p className="text-sm font-medium text-white">Contact</p>
               <a href="mailto:wizuplive@gmail.com" className="text-sm text-white/40 hover:text-white transition-all">wizuplive@gmail.com</a>
            </div>
            <p className="text-[10px] text-white/10 uppercase tracking-[0.2em]">We believe trust is built through clarity. If you have questions, reach out — we’ll respond.</p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPage;