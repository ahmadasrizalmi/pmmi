import React from 'react';
import { Link } from 'react-router-dom';
import { CameraIcon, CodeIcon } from '../components/Icons';
import AnimatedTestimonials, { Testimonial } from '../components/AnimatedTestimonials';

const optimizeCloudinaryUrl = (url: string, transformations: string): string => {
  return url.replace('/upload/', `/upload/${transformations}/`);
};

const GlassCard = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className ?? ''}`}>
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
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(162,28,175,0.25), transparent 50%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.12), transparent 40%)',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Pondok Multimedia
            <br />
            <span className="text-fuchsia-500">Munzalan Indonesia</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto">
            Sinergi unik ilmu agama dan keahlian digital — mencetak generasi Qurani yang mahir multimedia dan siap menghadapi era digital.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/daftar"
              className="inline-flex items-center px-8 py-3.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 font-bold text-white transition shadow-lg shadow-fuchsia-600/25"
            >
              Daftar Sekarang
            </Link>
            <Link
              to="/admissions"
              className="inline-flex items-center px-8 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-white font-semibold transition"
            >
              Info Pendaftaran
            </Link>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-20">
        {/* Programs */}
        <section className="py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Dua Jalur Utama</h2>
            <p className="text-zinc-400 mt-3 max-w-xl mx-auto">
              Didirikan tahun 2023, kami mempersiapkan santri agar tidak hanya hafal Al-Quran, tetapi juga mahir di bidang multimedia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  <CameraIcon className="w-7 h-7 text-fuchsia-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Konten Kreator</h3>
                  <p className="text-zinc-400 text-sm leading-6 mt-2">
                    Fotografi, videografi, desain grafis, & branding untuk konten dakwah yang berdampak.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  <CodeIcon className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Programmer</h3>
                  <p className="text-zinc-400 text-sm leading-6 mt-2">
                    Web & App Development dengan AI Tools untuk membangun solusi digital yang inovatif.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section className="py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Fasilitas Modern</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {facilitiesWithImages.map(item => (
              <div key={item.name} className="aspect-video rounded-lg overflow-hidden border border-white/10">
                <img
                  src={optimizeCloudinaryUrl(item.imageUrl!, 'w_600,c_fill,ar_16:9,f_auto,q_auto')}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {facilities.map(item => (
              <span key={item.name} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-300">
                {item.name}
              </span>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <h2 className="text-3xl font-bold mb-10 text-center">Apa Kata Mereka?</h2>
          <div className="relative flex h-[400px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-black/10">
            <div className="flex w-full justify-center gap-6">
              <AnimatedTestimonials testimonials={firstColumnTestimonials} duration={25} />
              <AnimatedTestimonials testimonials={secondColumnTestimonials} duration={30} className="hidden md:flex" />
              <AnimatedTestimonials testimonials={thirdColumnTestimonials} duration={22} className="hidden lg:flex" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-full h-full bg-gradient-to-b from-black via-black/10 via-80% to-black" />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-2xl border border-fuchsia-800/40 bg-zinc-950/80">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Bergabung?</h2>
            <p className="text-zinc-400 text-lg mb-8">
              Mulai perjalananmu di PMMI. Daftar sekarang dan wujudkan potensi digitalmu.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/daftar"
                className="inline-flex justify-center px-8 py-3.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 font-bold text-white transition shadow-lg shadow-fuchsia-600/25"
              >
                Daftar Sekarang
              </Link>
              <a
                href="https://wa.me/6288225461230"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center px-8 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 font-semibold transition"
              >
                WhatsApp Kami
              </a>
              <Link
                to="/portfolio"
                className="inline-flex justify-center px-8 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 font-semibold transition"
              >
                Lihat Portfolio
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default LandingPage;
