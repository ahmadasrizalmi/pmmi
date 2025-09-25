import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

const FacilitiesPage: React.FC = () => {
  const facilities = [
    "Ruang Kelas Modern",
    "Lab Komputer",
    "Studio Foto Profesional",
    "Ruang Podcast",
    "Mushola",
    "Perpustakaan",
    "Asrama Nyaman",
    "Internet Cepat",
    "Dapur Umum",
    "Mesin Cuci",
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Fasilitas Pondok</h1>
        <p className="mt-4 text-xl text-gray-400">Menyediakan lingkungan belajar yang lengkap dan modern.</p>
      </AnimatedSection>

      <AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {facilities.map((facility, index) => (
            <div key={index} className="p-6 h-32 text-center flex items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
              <h3 className="text-lg font-semibold">{facility}</h3>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default FacilitiesPage;