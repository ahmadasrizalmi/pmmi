

import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

// Fix: Made the 'children' prop optional to fix the "property 'children' is missing" error.
const GlassCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

// --- New Team Section Component ---

const teamSectionStyles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
    opacity: 0;
  }
`;

type TeamMember = {
  name: string;
  role: string;
  imageUrl: string;
};

const teamMembers: TeamMember[] = [
    { name: 'Yudi Suroto S.Sos', role: 'Pimpinan', imageUrl: 'https://res.cloudinary.com/dyuvttfa2/image/upload/v1758934704/Generated_Image_September_27_2025_-_7_56AM_c4xszi.png' },
    { name: 'Ahmad Asri Zalmi S.Sn', role: 'Kabag Pendidikan', imageUrl: 'https://res.cloudinary.com/dyuvttfa2/image/upload/v1758933657/56593605_10216670286102834_1790103856001056768_n_sljjuv.jpg' },
    { name: 'Arif Roihan C.L.Q, S.H', role: 'Mentor Photo & Video', imageUrl: 'https://res.cloudinary.com/dyuvttfa2/image/upload/v1758933658/Generated_Image_September_27_2025_-_7_30AM_xhxkyj.png' },
    { name: 'Faisal Nur Fajri', role: 'Staf Admin', imageUrl: 'https://i.pinimg.com/736x/79/63/a5/7963a5246188d408b8f28961a0cf2b90.jpg' },
];

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.31l5.74-6.57L0 .75h5.063l3.495 4.633L12.6.75ZM11.47 13.5h1.146L4.74 2.15H3.522l7.95 11.35Z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003Zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.282.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.231 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.232-.047h.001Zm4.905 1.882a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM8 4.465a3.535 3.535 0 1 0 0 7.07 3.535 3.535 0 0 0 0-7.07ZM8 5.535a2.465 2.465 0 1 1 0 4.93 2.465 2.465 0 0 1 0-4.93Z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0 0 3.603 0 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H11.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
    </svg>
);

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <div className="group flex flex-col items-center text-center p-6 bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl shadow-gray-900/20 hover:shadow-gray-900/40 transition-all duration-300 border border-gray-800 hover:border-gray-700 hover:-translate-y-1">
      <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-fuchsia-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <img
          className="relative w-full h-full rounded-full object-cover ring-4 ring-gray-800 group-hover:ring-gray-700 transition-all duration-300"
          src={member.imageUrl}
          alt={`Portrait of ${member.name}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://placehold.co/200x200/1F2937/9CA3AF?text=${member.name.split(' ').map(n => n[0]).join('')}`;
          }}
        />
      </div>
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors duration-300">{member.name}</h3>
      <p className="text-sm font-medium text-gray-300 mb-4 px-3 py-1 bg-gray-800 rounded-full">{member.role}</p>
      <div className="flex space-x-3">
        <a href="#" className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-purple-600 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg" aria-label={`${member.name}'s Twitter profile`}>
          <XIcon />
        </a>
        <a href="#" className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gradient-to-br hover:from-purple-500 hover:to-fuchsia-500 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg" aria-label={`${member.name}'s Instagram profile`}>
          <InstagramIcon />
        </a>
        <a href="#" className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-purple-700 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg" aria-label={`${member.name}'s Facebook profile`}>
          <FacebookIcon />
        </a>
      </div>
    </div>
  );
};

const TeamMemberSection: React.FC = () => {
  return (
    <section className="relative bg-black font-sans transition-colors overflow-hidden py-16">
      <div className="relative w-full px-4">
        <div className="w-full text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-purple-900/20 text-purple-400 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Struktur Pondok
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-6">
            Pimpinan & Staf Kami
          </h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Perkenalkan tim kami yang luar biasa - sinergi dari bakat, kreativitas, dan dedikasi, yang membentuk kesuksesan bersama dengan semangat dan inovasi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full justify-center">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TeamMemberCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- End of New Team Section Component ---


const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <style>{teamSectionStyles}</style>
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
      
      <TeamMemberSection />

    </div>
  );
};

export default AboutPage;