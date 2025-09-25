import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

const GalleryPage: React.FC = () => {
  const portfolioImages = ["p1", "p2", "p3", "p4", "p5", "p6"];
  const eventImages = ["e1", "e2", "e3", "e4", "e5", "e6"];

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-white">Galeri</h1>
        <p className="mt-4 text-xl text-gray-400">Karya dan kegiatan santri Pondok Multimedia Munzalan Indonesia.</p>
      </AnimatedSection>
      
      <AnimatedSection className="mb-20">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Portfolio Santri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {portfolioImages.map((seed, index) => (
                <div key={index} className="overflow-hidden rounded-lg group aspect-w-4 aspect-h-3">
                  <img 
                    src={`https://picsum.photos/seed/${seed}/800/600`}
                    alt={`Portfolio ${index + 1}`} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
        </div>
      </AnimatedSection>
      
      <AnimatedSection>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Kegiatan & Event</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {eventImages.map((seed, index) => (
                <div key={index} className="overflow-hidden rounded-lg group aspect-w-4 aspect-h-3">
                  <img 
                    src={`https://picsum.photos/seed/${seed}/800/600`} 
                    alt={`Event ${index + 1}`} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default GalleryPage;