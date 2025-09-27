import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

/**
 * Inserts Cloudinary transformations into a URL for optimization.
 * @param url The original Cloudinary image URL.
 * @param transformations A string of transformations (e.g., 'w_600,f_auto,q_auto').
 * @returns The new URL with transformations.
 */
const optimizeCloudinaryUrl = (url: string, transformations: string): string => {
  return url.replace('/upload/', `/upload/${transformations}/`);
};

const FacilitiesPage: React.FC = () => {
  const facilities = [
    { 
      name: "Studio Foto Profesional",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900111/Generated_Image_September_26_2025_-_11_22AM_pv8ie5.png"
    },
    { 
      name: "Lab Komputer",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900108/Generated_Image_September_26_2025_-_8_55PM_ikubv3.png"
    },
    { 
      name: "Ai Prompting Session",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900106/Generated_Image_September_26_2025_-_11_21AM_cb034z.png"
    },
    { 
      name: "Ruang Serbaguna",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900989/P1600904_tekrmm.png"
    },
    {
      name: "Drone Mavic Pro",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900114/Generated_Image_September_26_2025_-_9_14PM_lacwq6.png"
    },
    { 
      name: "Mushola",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900109/Generated_Image_September_26_2025_-_8_57PM_lyulvq.png"
    },
    { 
      name: "Coaching Mentor",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900109/Generated_Image_September_26_2025_-_9_04PM_vsfs4t.png"
    },
    {
      name: "Futsal on Saturday",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900120/IMG_8521_foqfxv.jpg"
    },
    { 
      name: "Internet Cepat",
      imageUrl: "https://res.cloudinary.com/dyuvttfa2/image/upload/v1758900107/Generated_Image_September_26_2025_-_9_28PM_dxhhkd.png"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Fasilitas Pondok</h1>
        <p className="mt-4 text-xl text-gray-400">Menyediakan lingkungan belajar yang lengkap dan modern.</p>
      </AnimatedSection>

      <AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {facilities.map((facility) => (
            <div 
              key={facility.name} 
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden flex flex-col"
            >
              {facility.imageUrl ? (
                <>
                  <div className="aspect-[4/3] bg-black/20">
                    <img 
                      src={optimizeCloudinaryUrl(facility.imageUrl, 'w_600,c_fill,ar_4:3,f_auto,q_auto')} 
                      alt={facility.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg font-semibold p-4 text-center">{facility.name}</h3>
                </>
              ) : (
                <div className="h-full min-h-[12rem] flex items-center justify-center p-6">
                   <h3 className="text-lg font-semibold text-center">{facility.name}</h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default FacilitiesPage;