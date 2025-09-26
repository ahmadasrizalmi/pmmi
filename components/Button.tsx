import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  as?: 'button' | 'a';
  href?: string;
  className?: string;
  variant?: 'default' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, as = 'button', href, className = '', variant = 'default', ...props }) => {
  
  const defaultClasses = `
    inline-block px-8 py-3 font-semibold text-lg text-white rounded-lg 
    bg-gradient-to-r from-violet-600 to-purple-600
    transition-all duration-300 ease-in-out
    hover:scale-105 hover:shadow-lg hover:shadow-violet-600/40
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-violet-500
  `;

  const outlineClasses = `
    inline-block px-8 py-3 font-semibold text-lg text-white rounded-lg 
    bg-white/10 border border-white/20 backdrop-blur-md
    transition-all duration-300 ease-in-out
    hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/10
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-400
  `;

  const baseClasses = variant === 'default' ? defaultClasses : outlineClasses;

  if (as === 'a') {
    return (
      <a
        href={href}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        className={`${baseClasses} ${className}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;