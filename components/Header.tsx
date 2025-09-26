import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MenuIcon, XIcon, ChevronDownIcon } from './Icons';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTentangOpen, setIsTentangOpen] = useState(false); // For mobile submenu

  const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'Profil Pondok', 
      path: '/about',
      children: [
        { name: 'Program', path: '/program' },
        { name: 'Fasilitas', path: '/facilities' },
        { name: 'Pengajar', path: '/teachers' },
      ]
    },
    { name: 'Admisi', path: '/admissions' },
    { name: 'Galeri', path: '/gallery' },
    { name: 'Kontak', path: '/contact' },
  ];

  const linkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors";
  const activeLinkClasses = "text-white bg-white/10";

  return (
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/">
              <img src="https://res.cloudinary.com/dyuvttfa2/image/upload/v1758903775/Desain_Tanpa_Judul_-_2_jhgspq.png" alt="PMM Indonesia Logo" className="h-10 w-auto" />
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                link.children ? (
                  <div key={link.name} className="relative group">
                    <NavLink
                      to={link.path}
                      className={({ isActive }) => `${linkClasses} flex items-center gap-1 ${isActive ? activeLinkClasses : ''}`}
                    >
                      {link.name}
                      <ChevronDownIcon className="w-4 h-4" />
                    </NavLink>
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-black/80 backdrop-blur-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                      <div className="py-1">
                        {link.children.map((childLink) => (
                          <NavLink
                            key={childLink.name}
                            to={childLink.path}
                            className={({ isActive }) => `block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white ${isActive ? 'bg-white/10' : ''}`}
                          >
                            {childLink.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                  >
                    {link.name}
                  </NavLink>
                )
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              if (!link.children) {
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                  >
                    {link.name}
                  </NavLink>
                );
              }
              
              return (
                <div key={link.name}>
                  <button
                    onClick={() => setIsTentangOpen(!isTentangOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-left ${linkClasses}`}
                  >
                    <span>{link.name}</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isTentangOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isTentangOpen && (
                    <div className="pl-5 mt-1 space-y-1 border-l-2 border-white/20 ml-2">
                      {link.children.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;