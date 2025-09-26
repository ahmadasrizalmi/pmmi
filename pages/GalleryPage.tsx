import React, { useState, useEffect } from 'react';
import AnimatedSection from '../components/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, IconArrowLeft, IconArrowRight } from '../components/Icons';

const imageGalleries = {
  photo: [
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900170/DSC08443_enkkkz.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900135/DSC08471_vanxko.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900164/IMG_9635_o1aziz.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900783/IMG_9331_qqaelo.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900150/IMG_9291_biikx9.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900146/IMG_0088_hdl3tz.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900782/IMG_0103_1_jrzvji.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900786/DSC03388_bfg2ua.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900785/IMG_0498_bobkhg.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900104/IMG-20250213-WA0059_2_bao7jp.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900133/DSC03616_jgolps.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900145/IMG_9356_b5nvqk.jpg",
  ],
  design: [
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900103/IMG-20240229-WA0018_ifxfmy.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900103/IMG-20240229-WA0008_kfyfjf.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900103/IMG-20240219-WA0012_esgruz.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900102/Biru_Putih_Modern_Promosi_Telur_Konten_Instagram_20241123_165013_0000_kzihl3.png",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900103/9_rdszkm.png",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900102/Coklat_dan_Krem_Promo_Telur_Ayam_Postingan_Instagram_20241123_161947_0000_nb3sdw.png",
  ],
  event: [
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900109/Generated_Image_September_26_2025_-_9_04PM_vsfs4t.png",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900109/Generated_Image_September_26_2025_-_8_57PM_lyulvq.png",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900120/IMG_8521_foqfxv.jpg",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900116/Generated_Image_September_26_2025_-_8_49PM_nurps8.png",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900979/P1600707_lhfup3.png",
    "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900989/P1600904_tekrmm.png",
  ],
};

/**
 * Inserts Cloudinary transformations into a URL for optimization.
 * @param url The original Cloudinary image URL.
 * @param transformations A string of transformations (e.g., 'w_600,f_auto,q_auto').
 * @returns The new URL with transformations.
 */
const optimizeCloudinaryUrl = (url: string, transformations: string): string => {
  return url.replace('/upload/', `/upload/${transformations}/`);
};

const GalleryPage: React.FC = () => {
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; list: keyof typeof imageGalleries | null; index: number }>({
    isOpen: false,
    list: null,
    index: 0,
  });

  const openLightbox = (list: keyof typeof imageGalleries, index: number) => {
    setLightbox({ isOpen: true, list, index });
  };

  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
  };
  
  const showNextImage = () => {
    if (!lightbox.list) return;
    const currentList = imageGalleries[lightbox.list];
    const nextIndex = (lightbox.index + 1) % currentList.length;
    setLightbox({ ...lightbox, index: nextIndex });
  };

  const showPrevImage = () => {
    if (!lightbox.list) return;
    const currentList = imageGalleries[lightbox.list];
    const prevIndex = (lightbox.index - 1 + currentList.length) % currentList.length;
    setLightbox({ ...lightbox, index: prevIndex });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNextImage();
      if (e.key === 'ArrowLeft') showPrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  const GallerySection = ({ title, images, listKey, aspect }: { title: string, images: string[], listKey: keyof typeof imageGalleries, aspect: 'aspect-[4/3]' | 'aspect-square' }) => (
    <AnimatedSection className="mb-20">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div 
              key={index} 
              className={`overflow-hidden rounded-lg group ${aspect} bg-black/20 cursor-pointer`}
              onClick={() => openLightbox(listKey, index)}
            >
              <img 
                src={optimizeCloudinaryUrl(url, 'w_600,c_limit,f_auto,q_auto')}
                alt={`${title} ${index + 1}`} 
                className={`w-full h-full transform group-hover:scale-110 transition-transform duration-500 ${aspect === 'aspect-square' ? 'object-contain p-2' : 'object-cover'}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Galeri</h1>
        <p className="mt-4 text-xl text-gray-400">Karya dan kegiatan santri Pondok Multimedia Munzalan Indonesia.</p>
      </AnimatedSection>
      
      <GallerySection title="Portfolio Fotografi" images={imageGalleries.photo} listKey="photo" aspect="aspect-[4/3]" />
      <GallerySection title="Portfolio Desain Grafis" images={imageGalleries.design} listKey="design" aspect="aspect-square" />
      <GallerySection title="Kegiatan & Event" images={imageGalleries.event} listKey="event" aspect="aspect-[4/3]" />

      <AnimatePresence>
        {lightbox.isOpen && lightbox.list && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.img
              key={lightbox.index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={optimizeCloudinaryUrl(imageGalleries[lightbox.list][lightbox.index], 'w_1200,c_limit,f_auto,q_auto')}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
            
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-5 right-5 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors"
              aria-label="Tutup pratinjau"
            >
              <XIcon className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); showPrevImage(); }}
              className="absolute left-5 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors"
              aria-label="Gambar sebelumnya"
            >
              <IconArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); showNextImage(); }}
              className="absolute right-5 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors"
              aria-label="Gambar berikutnya"
            >
              <IconArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
