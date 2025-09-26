
import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import Button from '../components/Button';

// Fix: Made the 'children' prop optional to fix the "property 'children' is missing" error.
const GlassCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Kontak & Lokasi</h1>
        <p className="mt-4 text-xl text-gray-400">Kami siap menjawab pertanyaan Anda.</p>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 gap-12 items-stretch">
        <AnimatedSection>
          <GlassCard className="p-8 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Informasi Kontak</h2>
            <div className="space-y-4 text-lg text-gray-300 flex-grow">
              <p>
                <strong className="text-white">Alamat:</strong><br />
                Jl. Parangtritis No.km 5, Jurug, BangunharjoKec, Kec. Sewon, Kabupaten Bantul, DIY 55187
              </p>
              <p>
                <strong className="text-white">WhatsApp:</strong><br />
                <a href="https://wa.me/6288225461230" className="hover:text-purple-300 transition-colors">+62 882-2546-1230</a>
              </p>
            </div>
            <div className="mt-8">
              <Button as="a" href="https://wa.me/6288225461230">
                WhatsApp Kami
              </Button>
            </div>
          </GlassCard>
        </AnimatedSection>

        <AnimatedSection className="min-h-[400px]">
           <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.570783182885!2d110.3663025750055!3d-7.835150892186831!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a57a555555555%3A0x6a4b3b2c2b3d3d3d!2sJl.%20Parangtritis%20No.km%205%2C%20Jurug%2C%20Bangunharjo%2C%20Kec.%20Sewon%2C%20Kabupaten%20Bantul%2C%20Daerah%20Istimewa%20Yogyakarta%2055187!5e0!3m2!1sen!2sid!4v1689234567890"
              width="100%"
              height="100%"
              className="rounded-xl border border-white/10 shadow-lg"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Pondok Multimedia Munzalan Indonesia"
          ></iframe>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ContactPage;