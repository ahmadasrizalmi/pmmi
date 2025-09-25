import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const TeachersPage: React.FC = () => {
  const teachers = [
    "Sarjana Fotografi & Diskomvis lulusan ISI Yogyakarta",
    "Praktisi Industri Kreatif berpengalaman",
    "Ustadz Lulusan Pondok Pesantren terkemuka"
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Tenaga Pengajar</h1>
        <p className="mt-4 text-xl text-gray-400">Dibimbing oleh para ahli di bidangnya.</p>
      </AnimatedSection>
      
      <AnimatedSection className="mb-16">
        <GlassCard className="p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Pengajar Tetap</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {teachers.map((teacher, index) => (
                <div key={index} className="p-6 bg-white/5 rounded-lg text-center">
                  <p className="text-lg text-gray-300">{teacher}</p>
                </div>
              ))}
            </div>
        </GlassCard>
      </AnimatedSection>

      <AnimatedSection>
        <GlassCard className="p-10 text-center">
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-400">Pengajar Tamu Bulanan</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Setiap bulan kami menghadirkan tenaga ahli dari industri multimedia nasional sebagai pengajar tamu untuk memberikan wawasan dan pengetahuan terbaru dari dunia kerja profesional.
          </p>
        </GlassCard>
      </AnimatedSection>
    </div>
  );
};

export default TeachersPage;