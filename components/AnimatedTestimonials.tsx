import React from 'react';
import { motion } from 'framer-motion';

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  duration?: number;
  className?: string;
}

const AnimatedTestimonials: React.FC<AnimatedTestimonialsProps> = ({
  testimonials,
  duration = 15,
  className = '',
}) => {
  return (
    <div className={`-my-3 ${className}`}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...testimonials, ...testimonials].map((testimonial, i) => (
            <div className="p-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg w-full max-w-xs" key={i}>
                <p className="text-gray-300 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-4 mt-5">
                <img
                    width={40}
                    height={40}
                    src={testimonial.src}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                    <div className="font-semibold tracking-tight leading-5 text-white">{testimonial.name}</div>
                    <div className="leading-5 text-purple-300 tracking-tight text-sm">{testimonial.designation}</div>
                </div>
                </div>
            </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AnimatedTestimonials;
