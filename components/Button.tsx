import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  as?: 'button' | 'a';
  href?: string;
  className?: string;
  variant?: 'default' | 'outline';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  as = 'button',
  href,
  className = '',
  // The 'variant' prop is kept for API compatibility but is not used in this new style.
  variant,
  ...props
}) => {

  // This CSS defines the custom property and animation needed for the shimmer effect.
  // By placing it inside the component, we keep it self-contained.
  const customCss = `
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    @keyframes shimmer-spin {
      to {
        --angle: 360deg;
      }
    }
  `;

  // Base classes for the button/link wrapper.
  const containerClasses = "relative inline-flex items-center justify-center p-[1.5px] bg-black rounded-full overflow-hidden group";
  
  // Classes for the inner span that holds the content, preserving text styles.
  const innerSpanClasses = "relative z-10 inline-flex items-center justify-center w-full h-full px-8 py-3 text-white bg-gray-900 rounded-full group-hover:bg-gray-800 transition-colors duration-300 font-semibold text-lg";
  
  // The JSX for the animated gradient border.
  const shimmerContent = (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: 'conic-gradient(from var(--angle), transparent 25%, #B33791, #8B5CF6, transparent 50%)',
          animation: 'shimmer-spin 2.5s linear infinite',
        }}
      />
      <span className={innerSpanClasses}>
        {children}
      </span>
    </>
  );

  // Conditionally render an 'a' tag or a 'button' tag.
  const componentToRender = as === 'a' ? (
    <a
      href={href}
      onClick={onClick as any}
      className={`${containerClasses} ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      // Fix: The 'props' object contains button-specific attributes that are incompatible with an anchor tag.
      // Casting to 'unknown' first before casting to anchor attributes resolves the TypeScript error,
      // acknowledging that we are intentionally changing the type context for this polymorphic component.
      {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {shimmerContent}
    </a>
  ) : (
    <button
      onClick={onClick}
      className={`${containerClasses} ${className}`}
      {...props}
    >
      {shimmerContent}
    </button>
  );

  return (
    <>
      <style>{customCss}</style>
      {componentToRender}
    </>
  );
};

export default Button;