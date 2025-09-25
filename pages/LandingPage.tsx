import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import Button from '../components/Button';
import { CameraIcon, CodeIcon } from '../components/Icons';
import GalaxyHero from '../components/GalaxyHero';

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <>
      <GalaxyHero />
      <main className="container mx-auto px-4 pb-20">
        {/* About & Program Summary */}
        <AnimatedSection className="py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <GlassCard className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Tentang Kami</h2>
            <p className="text-lg text-gray-300">
              Didirikan tahun 2023, kami hadir untuk mempersiapkan santri agar tidak hanya hafal Al-Quran, tetapi juga mahir di bidang multimedia dan siap menghadapi era digital.
            </p>
          </GlassCard>
          <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Program Utama</h2>
              <div className="space-y-6">
                  <div className="flex items-center gap-4">
                      <CameraIcon className="w-10 h-10 text-fuchsia-400 flex-shrink-0"/>
                      <div>
                          <h3 className="text-xl font-semibold">Jalur Konten Kreator</h3>
                          <p className="text-gray-400">Fotografi, videografi, desain, & branding.</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <CodeIcon className="w-10 h-10 text-purple-400 flex-shrink-0"/>
                      <div>
                          <h3 className="text-xl font-semibold">Jalur Programmer</h3>
                          <p className="text-gray-400">Web & App Development dengan AI Tools.</p>
                      </div>
                  </div>
              </div>
          </GlassCard>
        </div>
        </AnimatedSection>
        
        {/* Facilities Summary */}
        <AnimatedSection className="py-16 text-center">
          <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-8">Fasilitas Modern</h2>
              <div className="flex flex-wrap justify-center gap-3 text-base">
                {["Ruang Kelas", "Lab Komputer", "Studio Foto & Podcast", "Asrama", "Internet"].map(item => (
                  <span key={item} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full">{item}</span>
                ))}
              </div>
          </GlassCard>
        </AnimatedSection>
        
        {/* Contact Summary */}
        <AnimatedSection className="py-16">
          <GlassCard className="text-center p-10">
            <h2 className="text-4xl font-bold mb-4">Siap Bergabung?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Hubungi kami untuk informasi pendaftaran dan konsultasi lebih lanjut.
            </p>
            <Button as="a" href="https://wa.me/6288225461230">
              WhatsApp Kami
            </Button>
          </GlassCard>
        </AnimatedSection>
      </main>
    </>
  );
};

export default LandingPage;