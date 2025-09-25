import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconArrowRight } from './Icons';

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-x-20 items-center">
        <div className="relative h-80 w-full flex items-center justify-center">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.src}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  rotate: (Math.random() - 0.5) * 15
                }}
                animate={{
                  opacity: index === active ? 1 : 0.6,
                  scale: index === active ? 1 : 0.9,
                  rotate: index === active ? 0 : (index < active ? -10 : 10) + (Math.random() - 0.5) * 4,
                  y: index === active ? [0, -20, 0] : 0,
                  zIndex: testimonials.length - Math.abs(index - active),
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                  y: { duration: 0.8, type: 'spring', stiffness: 150 }
                }}
                className="absolute h-full w-full"
              >
                <img
                  src={testimonial.src}
                  alt={testimonial.name}
                  draggable={false}
                  className="h-full w-full rounded-3xl object-cover object-center shadow-2xl shadow-purple-900/20"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex justify-between flex-col py-4 h-full min-h-[250px] md:min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-grow"
            >
              <p className="text-lg text-gray-300 relative">
                <span className="absolute -left-4 -top-2 text-6xl text-purple-500/50 font-serif">&ldquo;</span>
                {testimonials[active].quote}
              </p>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white">
                  {testimonials[active].name}
                </h3>
                <p className="text-sm text-purple-300">
                  {testimonials[active].designation}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-4 pt-8 md:pt-0">
            <button
              onClick={handlePrev}
              className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center group transition-all duration-300 hover:bg-white/20 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <IconArrowLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center group transition-all duration-300 hover:bg-white/20 hover:scale-110"
              aria-label="Next testimonial"
            >
              <IconArrowRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTestimonials;