
import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

// Fix: Made the 'children' prop optional to fix the "property 'children' is missing" error.
const GlassCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const AboutPage: React.FC = () => {
  const leadership = [
    { role: "Pimpinan", name: "Yudi Suroto S.Sos" },
    { role: "Kabag Pendidikan", name: "Ahmad Asri Zalmi S.Sn" },
    { role: "Mentor Photo & Video", name: "Arif Roihan C.L.Q, S.H" },
    { role: "Staf Admin", name: "Faisal Nur Fajri" },
    { role: "Staf Admin", name: "Ria Rianti" }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Tentang Kami</h1>
        <p className="mt-4 text-xl text-gray-400">Mengenal lebih dalam Pondok Multimedia Munzalan Indonesia.</p>
      </AnimatedSection>

      <AnimatedSection className="mb-16">
        <GlassCard className="p-8">
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-400">Latar Belakang</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Sejak 2012, Masjid Kapal Munzalan Indonesia melalui Gerakan Infaq Beras telah bermitra dengan ribuan pondok dan panti asuhan. Pada 2023, Pondok Multimedia Munzalan Indonesia resmi berdiri untuk membekali santri dengan skill multimedia modern.
          </p>
        </GlassCard>
      </AnimatedSection>
      
      <AnimatedSection className="mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h3 className="text-2xl font-semibold text-fuchsia-400 mb-3">Visi</h3>
            <p className="text-gray-300">Menjadi pusat pendidikan tinggi di bidang multimedia berbasis pondok untuk santri dan penggerak dakwah.</p>
          </GlassCard>
          <GlassCard className="p-8">
            <h3 className="text-2xl font-semibold text-purple-400 mb-3">Misi</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Memperkuat pendidikan karakter & kepemimpinan.</li>
              <li>Membangun kolaborasi dengan lembaga dakwah dan industri.</li>
              <li>Menyediakan kurikulum terintegrasi multimedia dan ilmu Quran-Sunnah.</li>
            </ul>
          </GlassCard>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mb-16">
        <GlassCard className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Tujuan Kami</h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white/5 rounded-lg">Membentuk generasi Qurani yang menguasai multimedia.</div>
                <div className="p-4 bg-white/5 rounded-lg">Memberdayakan generasi muda melalui kerja & wirausaha.</div>
                <div className="p-4 bg-white/5 rounded-lg">Mengubah mindset santri dari mustahik menjadi munfiq.</div>
            </div>
        </GlassCard>
      </AnimatedSection>
      
      <AnimatedSection>
        <GlassCard className="p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Struktur Pimpinan & Staf</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {leadership.map((member) => (
                <div key={member.name} className="p-4 bg-white/5 rounded-lg">
                  <p className="font-bold text-base md:text-lg">{member.name}</p>
                  <p className="text-sm text-purple-300">{member.role}</p>
                </div>
              ))}
            </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  );
};

export default AboutPage;