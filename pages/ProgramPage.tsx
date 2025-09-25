import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import { CameraIcon, CodeIcon } from '../components/Icons';

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const ProgramPage: React.FC = () => {
  const additionalMaterials = ["Tahsin & Tahfidz", "Fiqih & Hadist", "Adab Kehidupan", "Public Speaking", "Digital Marketing"];

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Program Kami</h1>
        <p className="mt-4 text-xl text-gray-400">Kurikulum terintegrasi untuk masa depan digital santri.</p>
      </AnimatedSection>
      
      <div className="space-y-16">
        <AnimatedSection>
          <GlassCard className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <CameraIcon className="w-24 h-24 text-fuchsia-400 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold mb-3">Jalur Konten Kreator</h2>
                <p className="text-lg text-gray-300">
                  Fokus pada fotografi, videografi, desain grafis, copywriting & branding untuk membentuk kreator digital profesional yang mampu menghasilkan konten dakwah berkualitas tinggi.
                </p>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>
        
        <AnimatedSection>
          <GlassCard className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <CodeIcon className="w-24 h-24 text-purple-400 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold mb-3">Jalur Programmer</h2>
                <p className="text-lg text-gray-300">
                  Fokus pada pengembangan web & aplikasi dengan bantuan AI tools, meliputi UI/UX, front-end, back-end, dan automation untuk menciptakan solusi digital inovatif.
                </p>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        <AnimatedSection>
          <GlassCard className="text-center p-8">
            <h2 className="text-3xl font-bold mb-8">Materi Tambahan</h2>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              {additionalMaterials.map(item => (
                <span key={item} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full">{item}</span>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ProgramPage;