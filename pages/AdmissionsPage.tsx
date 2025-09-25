import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import Button from '../components/Button';

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const AdmissionsPage: React.FC = () => {
  const criteria = [
    "Lulusan pondok pesantren atau penggerak dakwah.",
    "Usia 18-20 tahun.",
    "Bisa membaca Al-Quran dengan baik (hafalan nilai plus).",
    "Lolos seleksi tahunan untuk memilih 20 santri terbaik."
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Penerimaan Santri</h1>
        <p className="mt-4 text-xl text-gray-400">Bergabunglah dengan kami untuk menjadi ahli multimedia Qurani.</p>
      </AnimatedSection>
      
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <AnimatedSection>
          <GlassCard className="p-8 h-full">
            <h2 className="text-3xl font-bold mb-4">Target Peserta Didik</h2>
            <p className="text-lg text-gray-300">
              Santri lulusan pondok pesantren dan penggerak dakwah yang siap menggabungkan ilmu agama dan keahlian multimedia untuk menyebarkan kebaikan di era digital.
            </p>
          </GlassCard>
        </AnimatedSection>
        
        <AnimatedSection>
          <GlassCard className="p-8 h-full">
            <h2 className="text-3xl font-bold mb-4">Kriteria Penerimaan</h2>
            <ul className="list-disc list-inside space-y-3 text-lg text-gray-300">
              {criteria.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </GlassCard>
        </AnimatedSection>
      </div>

      <AnimatedSection>
        <GlassCard className="text-center p-12">
          <h2 className="text-4xl font-bold mb-4">Daftar Sekarang</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Jadilah bagian dari 20 santri terpilih tahun ini. Hubungi kami untuk memulai proses pendaftaran.
          </p>
          <Button as="a" href="https://wa.me/6288225461230">
            Hubungi via WhatsApp
          </Button>
        </GlassCard>
      </AnimatedSection>
    </div>
  );
};

export default AdmissionsPage;