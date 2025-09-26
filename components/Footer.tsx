import React from 'react';
import { NavLink } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black border-t border-white/10 mt-20 overflow-hidden z-10">
      {/* Decorative Background Elements */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 w-full h-full"
        style={{
            background: 'radial-gradient(circle at 80% 20%, rgba(120, 85, 247, 0.15), transparent 40%), radial-gradient(circle at 20% 80%, rgba(219, 39, 119, 0.15), transparent 40%)'
        }}
      ></div>
       <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-purple-600/20 rounded-full blur-3xl"
      ></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="w-full max-w-4xl mx-auto text-center p-8 md:p-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl">
          
          <div className="mb-8 flex flex-col items-center">
            <img src="https://res.cloudinary.com/dyuvttfa2/image/upload/v1758903775/Desain_Tanpa_Judul_-_2_jhgspq.png" alt="PMM Indonesia Logo" className="h-16 w-auto mb-4" />
            <p className="mt-2 text-gray-400">
              Membentuk Generasi Qurani yang Mahir Multimedia.
            </p>
          </div>

          <div className="flex justify-center gap-6 mb-10">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <InstagramIcon className="w-7 h-7" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <YoutubeIcon className="w-7 h-7" />
               <span className="sr-only">YouTube</span>
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <FacebookIcon className="w-7 h-7" />
               <span className="sr-only">Facebook</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="text-lg font-semibold text-gray-200 mb-4">Navigasi Cepat</h4>
              <ul className="space-y-3">
                <li><NavLink to="/about" className="text-gray-400 hover:text-white transition-colors">Profil Pondok</NavLink></li>
                <li><NavLink to="/program" className="text-gray-400 hover:text-white transition-colors">Program</NavLink></li>
                <li><NavLink to="/gallery" className="text-gray-400 hover:text-white transition-colors">Galeri</NavLink></li>
                <li><NavLink to="/contact" className="text-gray-400 hover:text-white transition-colors">Kontak</NavLink></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-200 mb-4">Hubungi Kami</h4>
              <p className="text-gray-400 mb-2">
                Jl. Parangtritis km 5, Jurug, Bangunharjo, Sewon, Bantul, DIY 55187
              </p>
              <p className="text-gray-400">
                WhatsApp: <a href="https://wa.me/6288225461230" className="hover:text-purple-400 transition-colors">+62 882-2546-1230</a>
              </p>
            </div>
          </div>
          
        </div>
        <div className="mt-12 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pondok Multimedia Munzalan Indonesia. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;