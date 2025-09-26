import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import Button from '../components/Button';
import { CameraIcon, CodeIcon } from '../components/Icons';
import GalaxyHero from '../components/GalaxyHero';
import AnimatedTestimonials, { Testimonial } from '../components/AnimatedTestimonials';
import SectionWithMockup from '../components/SectionWithMockup';

/**
 * Inserts Cloudinary transformations into a URL for optimization.
 * @param url The original Cloudinary image URL.
 * @param transformations A string of transformations (e.g., 'w_600,f_auto,q_auto').
 * @returns The new URL with transformations.
 */
const optimizeCloudinaryUrl = (url: string, transformations: string): string => {
  return url.replace('/upload/', `/upload/${transformations}/`);
};

// Fix: Made the 'children' prop optional to fix the "property 'children' is missing" error.
const GlassCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const testimonials: Testimonial[] = [
  {
    quote: "Lingkungan belajarnya sangat mendukung. Saya tidak hanya belajar teknis, tapi juga adab dan kerja sama tim. PMM Indonesia benar-benar mengubah cara pandang saya.",
    name: "Fauzi",
    designation: "Santri Jalur Konten Kreator",
    src: "https://picsum.photos/seed/santri1/500/500",
  },
  {
    quote: "Dari yang tidak tahu apa-apa tentang coding, sekarang saya bisa membangun website. Mentornya sabar dan kurikulumnya relevan dengan industri. Keren!",
    name: "Aqil",
    designation: "Santri Jalur Programmer",
    src: "https://picsum.photos/seed/santri2/500/500",
  },
  {
    quote: "Perpaduan antara ilmu agama dan skill digital di sini luar biasa. Fasilitasnya lengkap, terutama studio, sangat membantu kami untuk praktik langsung.",
    name: "Wahyu",
    designation: "Santri Jalur Konten Kreator",
    src: "https://picsum.photos/seed/santri3/500/500",
  },
   {
    quote: "Kurikulumnya up-to-date dan mentornya sangat suportif. Saya merasa siap untuk terjun ke industri setelah lulus dari sini.",
    name: "Rosyid",
    designation: "Santri Jalur Programmer",
    src: "https://picsum.photos/seed/santri4/500/500"
  },
  {
    quote: "Belajar di PMM Indonesia membuka wawasan saya tentang bagaimana teknologi bisa digunakan untuk dakwah. Sangat inspiratif!",
    name: "Suyut",
    designation: "Santri Jalur Konten Kreator",
    src: "https://picsum.photos/seed/santri5/500/500"
  },
  {
    quote: "Fasilitas lab komputernya sangat memadai. Proses belajar coding jadi lebih lancar dan menyenangkan.",
    name: "Dewi Lestari",
    designation: "Santri Jalur Programmer",
    src: "https://picsum.photos/seed/santri6/500/500"
  },
];

const LandingPage: React.FC = () => {
  const firstColumnTestimonials = testimonials.slice(0, 3);
  const secondColumnTestimonials = testimonials.slice(3, 6);
  const thirdColumnTestimonials = [testimonials[4], testimonials[1], testimonials[0]];

  const facilities = [
    { name: "Ruang Kelas", imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900111/Generated_Image_September_26_2025_-_11_22AM_pv8ie5.png" },
    { name: "Studio Foto & Podcast", imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900106/Generated_Image_September_26_2025_-_11_21AM_cb034z.png" },
    { name: "Asrama", imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900114/Generated_Image_September_26_2025_-_9_14PM_lacwq6.png" },
    { name: "Lab Komputer" },
    { name: "Internet" },
  ];
  
  const facilitiesWithImages = facilities.filter(f => f.imageUrl);

  return (
    <>
      <GalaxyHero />
      <main className="container mx-auto px-4 pb-20">
        
        <SectionWithMockup
          title="Sinergi Unik: Ilmu Agama & Keahlian Digital"
          description={
            <>
              <p className="text-[#868f97] text-sm md:text-[15px] leading-6 mb-6">
                Didirikan tahun 2023, kami hadir untuk mempersiapkan santri agar tidak hanya hafal Al-Quran, tetapi juga mahir di bidang multimedia dan siap menghadapi era digital. Kami memiliki dua jalur utama:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <CameraIcon className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Jalur Konten Kreator</h3>
                    <p className="text-[#868f97] text-sm leading-6">Mendalami fotografi, videografi, desain, & branding untuk menciptakan konten dakwah yang berdampak.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <CodeIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Jalur Programmer</h3>
                    <p className="text-[#868f97] text-sm leading-6">Menguasai Web & App Development dengan AI Tools untuk membangun solusi digital yang inovatif.</p>
                  </div>
                </div>
              </div>
            </>
          }
          primaryImageSrc="https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900107/Generated_Image_September_26_2025_-_9_28PM_dxhhkd.png"
          secondaryImageSrc="https://picsum.photos/seed/creative-santri/600/900"
        />
        
        {/* Facilities Summary */}
        <AnimatedSection className="py-16 text-center">
          <GlassCard className="p-8">
              <h2 className="text-3xl font-bold mb-8">Fasilitas Modern</h2>
              
              <div className="flex flex-col-reverse sm:flex-col gap-10">
                {/* Image Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {facilitiesWithImages.map(item => (
                    <div key={item.name} className="aspect-video rounded-lg overflow-hidden border border-white/10 shadow-md">
                      <img 
                        src={optimizeCloudinaryUrl(item.imageUrl!, 'w_600,c_fill,ar_16:9,f_auto,q_auto')} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>

                {/* Text List */}
                <div className="flex flex-wrap justify-center gap-3">
                  {facilities.map(item => (
                     <span key={item.name} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                       {item.name}
                     </span>
                  ))}
                </div>
              </div>
          </GlassCard>
        </AnimatedSection>
        
        {/* Testimonials Section */}
        <AnimatedSection className="py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Apa Kata Mereka?</h2>
          <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-black/10">
            <div className="flex w-full justify-center gap-6">
                <AnimatedTestimonials testimonials={firstColumnTestimonials} duration={25} />
                <AnimatedTestimonials testimonials={secondColumnTestimonials} duration={30} className="hidden md:flex" />
                <AnimatedTestimonials testimonials={thirdColumnTestimonials} duration={22} className="hidden lg:flex" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-full h-full bg-gradient-to-b from-black via-black/10 via-80% to-black"></div>
          </div>
        </AnimatedSection>

        {/* New Call to Action Section */}
        <AnimatedSection className="py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Siap Bergabung?
              </h2>
              <p className="mb-8 max-w-xl text-gray-300 lg:text-lg">
                Hubungi kami untuk informasi pendaftaran dan konsultasi lebih lanjut.
              </p>
              <div className="flex w-full flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Button as="a" href="https://wa.me/6288225461230">
                  WhatsApp Kami
                </Button>
                <Button as="a" href="#/gallery" variant="outline">
                  Lihat Galeri
                </Button>
              </div>
            </div>
            <img
              src="https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900114/Generated_Image_September_26_2025_-_8_42PM_1_fdatei.png"
              alt="Santri berdiskusi tentang proyek multimedia"
              className="w-full h-auto max-h-96 rounded-2xl object-cover border border-white/10 shadow-lg"
            />
          </div>
        </AnimatedSection>

      </main>
    </>
  );
};

export default LandingPage;