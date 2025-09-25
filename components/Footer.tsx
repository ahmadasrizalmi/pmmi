import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 border-t border-white/10 mt-20 z-10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white">PMM Indonesia</h3>
            <p className="mt-4 text-gray-400">
              Membentuk Generasi Qurani yang Mahir Multimedia.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-200">Navigasi Cepat</h4>
            <ul className="mt-4 space-y-2">
              <li><NavLink to="/about" className="text-gray-400 hover:text-white transition-colors">Tentang Kami</NavLink></li>
              <li><NavLink to="/program" className="text-gray-400 hover:text-white transition-colors">Program</NavLink></li>
              <li><NavLink to="/gallery" className="text-gray-400 hover:text-white transition-colors">Galeri</NavLink></li>
              <li><NavLink to="/contact" className="text-gray-400 hover:text-white transition-colors">Kontak</NavLink></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-200">Hubungi Kami</h4>
            <p className="mt-4 text-gray-400">
              Jl. Parangtritis km 5, Jurug, Bangunharjo, Sewon, Bantul, DIY 55187
            </p>
            <p className="mt-2 text-gray-400">
              WhatsApp: <a href="https://wa.me/6288225461230" className="hover:text-purple-400 transition-colors">+62 882-2546-1230</a>
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pondok Multimedia Munzalan Indonesia. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;