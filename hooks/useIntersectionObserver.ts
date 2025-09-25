import { useState, useEffect, useRef, RefObject } from 'react';

// Fix: Update options type to include `triggerOnce` and implement the one-time trigger logic.
// This resolves the TypeScript error in components that use this hook, like AnimatedSection.tsx.
export const useIntersectionObserver = <T extends HTMLElement,>(options: IntersectionObserverInit & { triggerOnce?: boolean }): [RefObject<T>, boolean] => {
  const containerRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const { triggerOnce, ...observerOptions } = options;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (triggerOnce) {
          observer.unobserve(entry.target);
        }
      }
    }, observerOptions);

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, options]);

  return [containerRef, isVisible];
};
