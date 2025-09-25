import React, { useRef, useEffect, useState } from 'react';
import Button from './Button';

const GalaxyHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // A small delay can make the animation feel smoother on initial load
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; z: number }[] = [];

    const setup = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      stars = [];
      const numStars = window.innerWidth < 768 ? 500 : 1000;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * canvas.width,
        });
      }
    };

    const handleResize = () => {
      setup();
    };

    setup();
    window.addEventListener('resize', handleResize);

    const speed = 0.5;

    const draw = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= speed;
        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
        }

        const k = 128.0 / star.z;
        const px = star.x * k;
        const py = star.y * k;

        const size = (1 - star.z / width) * 4;
        const shade = parseInt(((1 - star.z / width) * 255).toString());
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        ctx.beginPath();
        ctx.arc(px, py, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <section className="relative flex items-center justify-center text-center overflow-hidden py-32 md:min-h-screen md:py-0">
        {/* Animated Background */}
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0"></canvas>

        {/* Transparent Purple Glow Overlay */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full z-5 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.25) 0%, rgba(0,0,0,0) 60%)',
            filter: 'blur(80px)'
          }}
        ></div>

        {/* Foreground Content */}
        <div className="relative z-10 px-4">
            <div className={`transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-300 tracking-tight leading-tight">
                    Pondok Multimedia <br /> Munzalan Indonesia
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                    Membentuk Generasi Qurani yang Mahir Multimedia dan Siap Menghadapi Era Digital.
                </p>
                <div className="mt-10">
                    <Button as="a" href="#/admissions">
                        Daftar Sekarang
                    </Button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default GalaxyHero;